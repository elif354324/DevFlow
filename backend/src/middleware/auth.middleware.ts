import { IncomingMessage, ServerResponse } from "node:http";
import { verifyToken } from "../utils/jwt";
import { sendJson } from "../utils/http";

export interface AuthenticatedRequest extends IncomingMessage {
  user?: {
    userId: string;
    username: string;
  };
}

export function authenticate(
  request: AuthenticatedRequest,
  response: ServerResponse,
): boolean {
  const authorization = request.headers.authorization;

  if (!authorization) {
    sendJson(response, 401, {
      error: "Authentication required",
    });

    return false;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    sendJson(response, 401, {
      error: "Invalid authorization header",
    });

    return false;
  }

  const payload = verifyToken(token);

  if (!payload) {
    sendJson(response, 401, {
      error: "Invalid or expired token",
    });

    return false;
  }

  request.user = payload;

  return true;
}