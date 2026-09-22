import crypto from "crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashToVerify = crypto.scryptSync(password, salt, 64).toString("hex");

  // Constant-time compare: hash both to fixed-length SHA-256 digests so that
  // timingSafeEqual receives equal-length buffers regardless of input length.
  const a = crypto.createHash("sha256").update(hashToVerify).digest();
  const b = crypto.createHash("sha256").update(hash).digest();
  return crypto.timingSafeEqual(a, b);
}
