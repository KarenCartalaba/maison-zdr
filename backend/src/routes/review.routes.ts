import { Router } from "express";
import { ReviewController } from "@/controllers/review";
import { validateSchema } from "@/middlewares/validate-schema";
import { createReviewSchema } from "@/schema/review";
import { AuthMiddleware } from "@/middlewares/auth-middleware";

const router = Router();
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/create", authMiddleware.execute, validateSchema(createReviewSchema), reviewController.create);

export default router;
