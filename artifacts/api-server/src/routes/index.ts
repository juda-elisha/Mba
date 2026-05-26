import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import offerwallRouter from "./offerwall";
import withdrawalsRouter from "./withdrawals";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(offerwallRouter);
router.use(withdrawalsRouter);
router.use(leaderboardRouter);

export default router;
