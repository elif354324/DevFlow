import { getDashboardStats } from "../services/dashboard.service";
import { sendJson } from "../utils/http";
import {
  AuthenticatedRequest,
  authenticate,
} from "../middleware/auth.middleware";

export function handleDashboardRoute(
  request: AuthenticatedRequest,
  response: import("node:http").ServerResponse,
): boolean {
  const method = request.method;
  const url = request.url;

  if (method === "GET" && url === "/dashboard/stats") {
    if (!authenticate(request, response)) {
      return true;
    }

    const stats = getDashboardStats(request.user!.userId);

    sendJson(response, 200, stats);

    return true;
  }

  return false;
}