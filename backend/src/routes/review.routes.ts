import { Router } from "express";
import { ReviewController } from "@/controllers/review.controller";
import { MyProfileController } from "@/controllers/my-profile.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import { createReviewSchema, updateReviewSchema, deleteReviewSchema } from "@/schema/review";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { moderateLimiter } from "@/lib/rate-limit";

const router = Router();
const reviewController = new ReviewController();
const myProfileController = new MyProfileController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/create", authMiddleware.execute, moderateLimiter, validateSchema(createReviewSchema), reviewController.create);
router.get("/v1/mine", authMiddleware.execute, myProfileController.getMyReviews);
router.get("/v1/pending", authMiddleware.execute, myProfileController.getPendingReviews);
// Owner-scoped writes: both services 403 unless the review's userId matches
// the authenticated caller, so a review can never be edited or removed by
// another guest. Declared after the fixed GET paths above on purpose.
router.patch("/v1/:id", authMiddleware.execute, validateSchema(updateReviewSchema), reviewController.update);
router.delete("/v1/:id", authMiddleware.execute, validateSchema(deleteReviewSchema), reviewController.remove);

export default router;
