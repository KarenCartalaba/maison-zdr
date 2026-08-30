import { Request, Response } from "express";
import { SignupUserService, LoginCredentialsService, VerifyEmailService, RefreshTokenService, ResendEmailVerificationService, GetMeService, UpdateProfileService, ForgotPasswordService, ChangePasswordService, GoogleLoginService } from "@/services/auth";
import { TokenExpiry, toMilliseconds } from "@/lib/jwt";
import { ENV } from "@/config/env";

export class AuthController {
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = ENV.NODE_ENV === "production";

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: toMilliseconds(TokenExpiry.ACCESS_TOKEN_EXPIRES),
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: toMilliseconds(TokenExpiry.REFRESH_TOKEN_EXPIRES),
    });
  }

  public signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    const result = await SignupUserService(name, email, password);
    return res.status(result.code).json(result);
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const result = await VerifyEmailService(token);
    return res.status(result.code).json(result);
  };

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const result = await LoginCredentialsService(email, password);

    if (result.code === 200 && result.data?.tokens) {
      this.setAuthCookies(res, result.data.tokens);
    }

    return res.status(result.code).json(result);
  };

  public refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const result = await RefreshTokenService(refreshToken);

    if (result.code === 200 && result.data?.tokens) {
      this.setAuthCookies(res, result.data.tokens);
    }

    return res.status(result.code).json(result);
  };

  public logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ code: 200, status: "success", message: "Logged out successfully" });
  };

  public resendEmailVerification = async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    const result = await ResendEmailVerificationService(email);
    return res.status(result.code).json(result);
  };

  public me = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await GetMeService(userId);
    return res.status(result.code).json(result);
  };

  public updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { name, email, phone, imageBase64 } = req.body ?? {};
    const result = await UpdateProfileService(userId, { name, email, phone }, imageBase64);
    return res.status(result.code).json(result);
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    const result = await ForgotPasswordService(email);
    return res.status(result.code).json(result);
  };

  public changePassword = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { currentPassword, newPassword } = req.body ?? {};
    const result = await ChangePasswordService(userId, currentPassword, newPassword);
    return res.status(result.code).json(result);
  };

  public googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body ?? {};
    const result = await GoogleLoginService(idToken);

    if (result.code === 200 && result.data?.tokens) {
      this.setAuthCookies(res, result.data.tokens);
    }

    return res.status(result.code).json(result);
  };
}
