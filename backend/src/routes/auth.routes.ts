import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { MyProfileController } from "@/controllers/my-profile.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import { signupSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, refreshTokenSchema, forgotPasswordSchema, changePasswordSchema, resetPasswordSchema } from "@/schema/auth";
import { AuthMiddleware } from "@/middlewares/auth-middleware";

const router = Router();
const authController = new AuthController();
const myProfileController = new MyProfileController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/signup", validateSchema(signupSchema), authController.signup);
router.post("/v1/login", validateSchema(loginSchema), authController.login);
router.post("/v1/google-login", authController.googleLogin);
router.get("/v1/verify-email", validateSchema(verifyEmailSchema), authController.verifyEmail);
router.post("/v1/resend-email-verification", validateSchema(resendVerificationSchema), authController.resendEmailVerification);
router.post("/v1/refresh-token", validateSchema(refreshTokenSchema), authController.refresh);
router.post("/v1/logout", authController.logout);
router.get("/v1/me", authMiddleware.execute, authController.me);
router.put("/v1/update-profile", authMiddleware.execute, authController.updateProfile);
router.post("/v1/forgot-password", validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post("/v1/reset-password", validateSchema(resetPasswordSchema), authController.resetPassword);
router.get("/v1/reset-password", authController.validateResetToken);
router.put("/v1/change-password", authMiddleware.execute, validateSchema(changePasswordSchema), authController.changePassword);
router.get("/v1/my-registrations", authMiddleware.execute, myProfileController.getMyRegistrations);
router.get("/v1/profile-stats", authMiddleware.execute, myProfileController.getProfileStats);
router.get("/v1/my-reviews", authMiddleware.execute, myProfileController.getMyReviews);
router.get("/v1/pending-reviews", authMiddleware.execute, myProfileController.getPendingReviews);

export default router;
