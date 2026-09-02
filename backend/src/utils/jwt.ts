import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devflow-development-secret";

export interface JwtPayload {
  userId: string;
  username: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "username" in decoded
    ) {
      return {
        userId: String(decoded.userId),
        username: String(decoded.username),
      };
    }

    return null;
  } catch {
    return null;
  }
}