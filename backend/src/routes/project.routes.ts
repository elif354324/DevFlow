import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service";
import { 
  AuthenticatedRequest,
  authenticate,
 } from "../middleware/auth.middleware";
import { sendJson, readRequestBody } from "../utils/http";

interface CreateProjectRequest {
  name: string;
  description: string;
}

export async function handleProjectRoute(
  request: AuthenticatedRequest,
  response: import("node:http").ServerResponse,
): Promise<boolean> {
  const method = request.method;
  const url = request.url;

  if (!authenticate(request, response)) {
    return true;
  }

  // --------------------------------
  // GET ALL PROJECTS
  // --------------------------------

  if (method === "GET" && url === "/projects") {
    const projects = getAllProjects(request.user!.userId);

    sendJson(response, 200, projects);

    return true;
  }

  // --------------------------------
  // CREATE PROJECT
  // --------------------------------

  if (method === "POST" && url === "/projects") {
    const body = await readRequestBody(request);

    try {
      const data = JSON.parse(body) as CreateProjectRequest;

      if (!data.name?.trim() || !data.description?.trim()) {
        sendJson(response, 400, {
          error: "Name and description are required",
        });

        return true;
      }

      const project = createProject(request.user!.userId, {
        name: data.name,
        description: data.description,
      });

      sendJson(response, 201, project);

      return true;
    } catch {
      sendJson(response, 400, {
        error: "Invalid JSON",
      });

      return true;
    }
  }

  // --------------------------------
  // PROJECT ID ROUTES
  // --------------------------------

  if (url?.match(/^\/projects\/[^/]+$/)) {
    const projectId = url.split("/")[2];

    if (!projectId) {
      sendJson(response, 400, {
        error: "Project ID is required",
      });

      return true;
    }

    // --------------------------------
    // GET PROJECT
    // --------------------------------

    if (method === "GET") {
      const project = getProjectById(projectId, request.user!.userId);

      if (!project) {
        sendJson(response, 404, {
          error: "Project not found",
        });

        return true;
      }

      sendJson(response, 200, project);

      return true;
    }

    // --------------------------------
    // UPDATE PROJECT
    // --------------------------------

    if (method === "PUT") {
      const project = getProjectById(projectId, request.user!.userId);

      if (!project) {
        sendJson(response, 404, {
          error: "Project not found",
        });

        return true;
      }

      const body = await readRequestBody(request);

      try {
        const data = JSON.parse(body) as CreateProjectRequest;

        if (!data.name?.trim() || !data.description?.trim()) {
          sendJson(response, 400, {
            error: "Name and description are required",
          });

          return true;
        }

        const updatedProject = updateProject(projectId, request.user!.userId, {
          name: data.name,
          description: data.description,
        });

        sendJson(response, 200, updatedProject);

        return true;
      } catch {
        sendJson(response, 400, {
          error: "Invalid JSON",
        });

        return true;
      }
    }

    // --------------------------------
    // DELETE PROJECT
    // --------------------------------

    if (method === "DELETE") {
      const project = deleteProject(projectId, request.user!.userId);

      if (!project) {
        sendJson(response, 404, {
          error: "Project not found",
        });

        return true;
      }

      sendJson(response, 200, {
        message: "Project deleted successfully",
        project,
      });

      return true;
    }
  }

  return false;
}