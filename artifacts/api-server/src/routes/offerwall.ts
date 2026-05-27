import { Router } from "express";
import crypto from "crypto";
import { db, usersTable, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// placement_id identifies your wall — not a secret, it's in the public embed URL.
// Falls back to the known value so the wall works even before the env var is set.
const REWARDSRIVER_PLACEMENT_ID =
  process.env["REWARDSRIVER_APP_ID"] ?? "6a16384ee007ae6b2d851b73";
const REWARDSRIVER_SECRET_KEY = process.env["REWARDSRIVER_SECRET_KEY"];

// GET /api/offerwall/token — returns the embed URL for the user's offerwall
router.get("/offerwall/token", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.appUser.id;

  // Build the wall URL with placement_id and user_id so RewardsRiver
  // knows which wall to show and can attribute completions to this user
  const params = new URLSearchParams({
    placement_id: REWARDSRIVER_PLACEMENT_ID,
    user_id: userId,
  });

  const embedUrl = `https://www.rewardsriver.com/wall?${params.toString()}`;
  res.json({ embedUrl, userId });
});

// GET /api/offerwall/postback — called by RewardsRiver servers to award points
// This endpoint MUST be publicly accessible (no auth middleware)
router.get("/offerwall/postback", async (req, res) => {
  const {
    user_id,
    amount,
    offer_id,
    offer_name,
    sig,
    transaction_id,
  } = req.query as Record<string, string>;

  // Validate required fields
  if (!user_id || !amount || !offer_id || !offer_name || !sig || !transaction_id) {
    res.status(400).json({ error: "Missing required parameters" });
    return;
  }

  // HMAC signature verification — prevents fake postbacks
  if (REWARDSRIVER_SECRET_KEY) {
    const expectedSig = crypto
      .createHmac("sha256", REWARDSRIVER_SECRET_KEY)
      .update(`${user_id}:${amount}:${offer_id}:${transaction_id}`)
      .digest("hex");

    if (!crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSig, "hex"),
    )) {
      req.log.warn({ user_id, offer_id }, "Invalid postback signature");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }
  }

  const pointsToAward = Math.floor(parseFloat(amount));
  if (isNaN(pointsToAward) || pointsToAward <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  // Check user exists
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, user_id));

  if (!user) {
    req.log.warn({ user_id }, "Postback for unknown user");
    res.status(400).json({ error: "User not found" });
    return;
  }

  // Idempotency check — ignore duplicate postbacks
  const [existingTx] = await db
    .select({ id: transactionsTable.id })
    .from(transactionsTable)
    .where(eq(transactionsTable.externalTransactionId, transaction_id));

  if (existingTx) {
    // Already processed — respond OK to prevent re-delivery
    res.json({ message: "OK" });
    return;
  }

  // Award points atomically
  await db.transaction(async (tx) => {
    await tx.insert(transactionsTable).values({
      id: crypto.randomUUID(),
      userId: user_id,
      type: "earn",
      points: pointsToAward,
      description: `Completed: ${offer_name}`,
      offerName: offer_name,
      offerId: offer_id,
      externalTransactionId: transaction_id,
      status: "completed",
    });

    await tx
      .update(usersTable)
      .set({
        pointsBalance: sql`${usersTable.pointsBalance} + ${pointsToAward}`,
        totalEarned: sql`${usersTable.totalEarned} + ${pointsToAward}`,
        offersCompleted: sql`${usersTable.offersCompleted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user_id));
  });

  req.log.info({ user_id, points: pointsToAward, offer_name }, "Points awarded via postback");
  res.json({ message: "OK" });
});

export default router;
