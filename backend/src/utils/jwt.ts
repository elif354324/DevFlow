import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

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

    if (typeof decoded === "string") {
      return null;
    }

    if (
      decoded &&
      typeof decoded === "object" &&
      "userId" in decoded &&
      "username" in decoded
    ) {
      return {
        userId: String(
          (decoded as { userId: unknown }).userId,
        ),
        username: String(
          (decoded as { username: unknown }).username,
        ),
      };
    }

    return null;
  } catch {
    return null;
  }
}