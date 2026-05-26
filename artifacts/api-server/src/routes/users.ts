import { Router } from "express";
import { db, usersTable, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// GET /api/users/me/balance
router.get("/users/me/balance", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const u = authReq.appUser;

  res.json({
    points: u.pointsBalance,
    pointsValueMwk: u.pointsBalance / 100,
  });
});

// GET /api/users/me/stats
router.get("/users/me/stats", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const u = authReq.appUser;

  // Calculate rank: count users with more points than current user
  const allUsers = await db
    .select({ pointsBalance: usersTable.pointsBalance })
    .from(usersTable)
    .orderBy(desc(usersTable.totalEarned));

  const rank = allUsers.filter(
    (other) => other.pointsBalance > u.pointsBalance,
  ).length + 1;

  res.json({
    totalEarned: u.totalEarned,
    totalWithdrawn: u.totalWithdrawnMwk / 100,
    currentBalance: u.pointsBalance,
    rank,
    offersCompleted: u.offersCompleted,
  });
});

// GET /api/users/me/transactions
router.get("/users/me/transactions", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;

  const txs = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, authReq.appUser.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(100);

  res.json(
    txs.map((tx) => ({
      id: tx.id,
      type: tx.type,
      points: tx.points,
      amountMwk: tx.amountMwk !== null ? tx.amountMwk / 100 : null,
      description: tx.description,
      offerName: tx.offerName,
      status: tx.status,
      createdAt: tx.createdAt,
    })),
  );
});

export default router;
