import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import { authLimiter, loginLimiter } from "@/lib/rate-limit";
import { signupSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, refreshTokenSchema, forgotPasswordSchema, changePasswordSchema, resetPasswordSchema } from "@/schema/auth";
import { AuthMiddleware } from "@/middlewares/auth-middleware";

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/signup", authLimiter, validateSchema(signupSchema), authController.signup);
router.post("/v1/login", loginLimiter, validateSchema(loginSchema), authController.login);
router.post("/v1/google-login", authLimiter, authController.googleLogin);
router.get("/v1/verify-email", validateSchema(verifyEmailSchema), authController.verifyEmail);
router.post("/v1/resend-email-verification", authLimiter, validateSchema(resendVerificationSchema), authController.resendEmailVerification);
router.post("/v1/refresh-token", authLimiter, validateSchema(refreshTokenSchema), authController.refresh);
router.post("/v1/logout", authLimiter, authController.logout);
router.get("/v1/me", authMiddleware.execute, authController.me);
router.post("/v1/forgot-password", authLimiter, validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post("/v1/reset-password", authLimiter, validateSchema(resetPasswordSchema), authController.resetPassword);
router.get("/v1/reset-password", authController.validateResetToken);
router.put("/v1/change-password", authMiddleware.execute, validateSchema(changePasswordSchema), authController.changePassword);

export default router;
