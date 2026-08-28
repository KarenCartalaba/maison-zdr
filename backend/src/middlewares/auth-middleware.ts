import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, JwtPayload } from "@/lib/jwt";

type AuthenticatedRequest = Request & { user?: JwtPayload };

export class AuthMiddleware {
  public execute = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    let accessToken = this.extractBearerToken(req.headers.authorization);

    if (!accessToken && req.cookies) {
      accessToken = req.cookies.accessToken;
    }

    if (!accessToken) {
      return res.status(401).json({ code: 401, status: "error", message: "Authentication required" });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return res.status(401).json({ code: 401, status: "error", message: "Invalid or expired token" });
    }

    authReq.user = payload;
    return next();
  };

  private extractBearerToken(header?: string) {
    if (!header) return undefined;
    const [scheme, token] = header.split(" ");
    if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return undefined;
    return token.trim();
  }
}
