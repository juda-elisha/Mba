import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

// GET /api/leaderboard
router.get("/leaderboard", async (req, res) => {
  const top = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
      totalEarned: usersTable.totalEarned,
      offersCompleted: usersTable.offersCompleted,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.totalEarned))
    .limit(20);

  res.json(
    top.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      avatarUrl: u.avatarUrl,
      totalEarned: u.totalEarned,
      offersCompleted: u.offersCompleted,
    })),
  );
});

export default router;
