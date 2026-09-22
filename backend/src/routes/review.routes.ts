import { Router } from "express";
import { ReviewController } from "@/controllers/review.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import { createReviewSchema } from "@/schema/review";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { moderateLimiter } from "@/lib/rate-limit";

const router = Router();
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/create", authMiddleware.execute, moderateLimiter, validateSchema(createReviewSchema), reviewController.create);

export default router;
