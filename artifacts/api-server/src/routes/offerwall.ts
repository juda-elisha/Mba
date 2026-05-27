import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// placement_id identifies your wall — not a secret, it's in the public embed URL.
// Falls back to the known value so the wall works even before the env var is set.
const REWARDSRIVER_PLACEMENT_ID =
  process.env["REWARDSRIVER_APP_ID"] ?? "6a16384ee007ae6b2d851b73";

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

export default router;
