import { createServer } from "node:http";
import { handleHealthRoute } from "./routes/health.routes";
import { handleProjectRoute } from "./routes/project.routes";
import { handleTaskRoute } from "./routes/task.routes";
import { handleDashboardRoute } from "./routes/dashboard.routes";
import { sendJson } from "./utils/http";
import { handleAuthRoute } from "./routes/auth.routes";

// ------------------------------------
// SERVER
// ------------------------------------

const server = createServer(async (request, response) => {
  try {
    const method = request.method;
    const url = request.url;

    // --------------------------------
    // CORS
    // --------------------------------

    response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    // --------------------------------
    // AUTH ROUTES
    // --------------------------------

    if (await handleAuthRoute(request, response)) {
      return;
    }

    // --------------------------------
    // HEALTH ROUTE
    // --------------------------------

    if (handleHealthRoute(method, url, response)) {
      return;
    }

    // --------------------------------
    // PROJECT ROUTES
    // --------------------------------

    const projectRouteHandled = await handleProjectRoute(
      request,
      response,
    );

    if (projectRouteHandled) {
      return;
    }

    // --------------------------------
    // TASK ROUTES
    // --------------------------------

    if (await handleTaskRoute(request, response)) {
      return;
    }

    // --------------------------------
    // DASHBOARD ROUTES
    // --------------------------------

    if (handleDashboardRoute(request, response)) {
      return;
    }

    // --------------------------------
    // 404
    // --------------------------------

    sendJson(response, 404, {
      error: "Not Found",
    });
  } catch (error) {
    console.error(error);

    sendJson(response, 500, {
      error: "Internal server error",
    });
  }
});

// ------------------------------------
// START SERVER
// ------------------------------------

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});