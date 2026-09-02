import { 
  getDashboardStats,
  getProjectProgress
 } from "../services/dashboard.service";
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

  if (
  method === "GET" &&
  url === "/dashboard/project-progress"
) {
  if (!authenticate(request, response)) {
    return true;
  }

  const progress = getProjectProgress(
    request.user!.userId,
  );

  sendJson(response, 200, progress);

  return true;
}

  return false;
}