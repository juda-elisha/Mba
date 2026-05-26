import { Router } from "express";
import crypto from "crypto";
import { db, usersTable, transactionsTable, withdrawalsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { RequestWithdrawalBody } from "@workspace/api-zod";
import { sendMobileMoney } from "../lib/paychangu";

const router = Router();

const MIN_POINTS = 5000; // 50 MWK minimum withdrawal

// GET /api/withdrawals
router.get("/withdrawals", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;

  const rows = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, authReq.appUser.id))
    .orderBy(desc(withdrawalsTable.createdAt))
    .limit(50);

  res.json(
    rows.map((w) => ({
      id: w.id,
      points: w.points,
      amountMwk: w.amountMwk / 100,
      provider: w.provider,
      phoneNumber: w.phoneNumber,
      status: w.status,
      paychanguRef: w.paychanguRef,
      createdAt: w.createdAt,
    })),
  );
});

// POST /api/withdrawals
router.post("/withdrawals", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.appUser;

  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation error" });
    return;
  }

  const { points, provider, phoneNumber } = parsed.data;

  if (points < MIN_POINTS) {
    res.status(400).json({ error: `Minimum withdrawal is ${MIN_POINTS} points (MWK ${MIN_POINTS / 100})` });
    return;
  }

  if (user.pointsBalance < points) {
    res.status(400).json({ error: "Insufficient points balance" });
    return;
  }

  // Validate Malawi phone number format
  const cleanPhone = phoneNumber.replace(/\s/g, "");
  const malawiPhoneRegex = /^(\+265|0)(88|99|31|32|111|88|77)[0-9]{6,7}$/;
  if (!malawiPhoneRegex.test(cleanPhone)) {
    res.status(400).json({ error: "Invalid Malawi phone number (e.g. +265888123456 or 0888123456)" });
    return;
  }

  const amountMwk = Math.floor(points / 100); // 100 points = 1 MWK
  const amountMwkCents = amountMwk * 100; // stored as cents
  const withdrawalId = crypto.randomUUID();
  const txRef = `RRC-${withdrawalId.replace(/-/g, "").slice(0, 16).toUpperCase()}`;

  // Deduct points and create withdrawal atomically
  const withdrawal = await db.transaction(async (tx) => {
    // Re-check balance inside transaction
    const [fresh] = await tx
      .select({ pointsBalance: usersTable.pointsBalance })
      .from(usersTable)
      .where(eq(usersTable.id, user.id));

    if (!fresh || fresh.pointsBalance < points) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // Deduct points
    await tx
      .update(usersTable)
      .set({
        pointsBalance: sql`${usersTable.pointsBalance} - ${points}`,
        totalWithdrawnMwk: sql`${usersTable.totalWithdrawnMwk} + ${amountMwkCents}`,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    // Record withdrawal
    const [w] = await tx
      .insert(withdrawalsTable)
      .values({
        id: withdrawalId,
        userId: user.id,
        points,
        amountMwk: amountMwkCents,
        provider,
        phoneNumber: cleanPhone,
        status: "processing",
        paychanguTxRef: txRef,
      })
      .returning();

    // Record transaction
    await tx.insert(transactionsTable).values({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "withdraw",
      points: -points,
      amountMwk: amountMwkCents,
      description: `Withdrawal to ${provider === "airtel" ? "Airtel Money" : "TNM Mpamba"} ${cleanPhone}`,
      status: "pending",
    });

    return w;
  });

  // Send money via PayChangu (async — don't block the response)
  sendMobileMoney({
    amount: amountMwk,
    phoneNumber: cleanPhone,
    provider,
    txRef,
    narration: `RewardsRiver Cash withdrawal`,
  }).then(async (result) => {
    if (result.success) {
      await db
        .update(withdrawalsTable)
        .set({ status: "completed", paychanguRef: result.reference ?? null, updatedAt: new Date() })
        .where(eq(withdrawalsTable.id, withdrawalId));
    } else {
      req.log.error({ result, withdrawalId }, "PayChangu payout failed");
      // Refund points on failure
      await db.transaction(async (tx) => {
        await tx
          .update(usersTable)
          .set({
            pointsBalance: sql`${usersTable.pointsBalance} + ${points}`,
            totalWithdrawnMwk: sql`${usersTable.totalWithdrawnMwk} - ${amountMwkCents}`,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, user.id));

        await tx
          .update(withdrawalsTable)
          .set({
            status: "failed",
            failureReason: result.message,
            updatedAt: new Date(),
          })
          .where(eq(withdrawalsTable.id, withdrawalId));
      });
    }
  }).catch((err) => {
    req.log.error({ err, withdrawalId }, "PayChangu payout exception");
  });

  res.status(201).json({
    id: withdrawal!.id,
    points: withdrawal!.points,
    amountMwk: withdrawal!.amountMwk / 100,
    provider: withdrawal!.provider,
    phoneNumber: withdrawal!.phoneNumber,
    status: withdrawal!.status,
    paychanguRef: withdrawal!.paychanguRef,
    createdAt: withdrawal!.createdAt,
  });
});

export default router;
