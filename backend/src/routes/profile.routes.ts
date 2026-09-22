import { Router } from "express";
import { MyProfileController } from "@/controllers/my-profile.controller";
import { AuthController } from "@/controllers/auth.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";

const router = Router();
const myProfileController = new MyProfileController();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// ==================== Profile (any authenticated user) ====================
router.get("/v1/stats", authMiddleware.execute, myProfileController.getProfileStats);
router.put("/v1/update", authMiddleware.execute, authController.updateProfile);

export default router;
