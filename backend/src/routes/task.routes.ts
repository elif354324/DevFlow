import {
  getTasksByProjectId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service";
import { getProjectById } from "../services/project.service";
import { sendJson, readRequestBody } from "../utils/http";
import {
  AuthenticatedRequest,
  authenticate,
} from "../middleware/auth.middleware";

interface CreateTaskRequest {
  title: string;
  description: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
}

export async function handleTaskRoute(
  request: AuthenticatedRequest,
  response: import("node:http").ServerResponse,
): Promise<boolean> {
  const method = request.method;
  const url = request.url;

    const isTaskRoute =
    url?.match(/^\/projects\/[^/]+\/tasks$/) ||
    url?.startsWith("/tasks/");

  if (isTaskRoute) {
    if (!authenticate(request, response)) {
      return true;
    }
  }

  // --------------------------------
  // PROJECT TASK ROUTES
  // --------------------------------

  if (url?.match(/^\/projects\/[^/]+\/tasks$/)) {
    const projectId = url.split("/")[2];

    if (!projectId) {
      sendJson(response, 400, {
        error: "Project ID is required",
      });

      return true;
    }

    // GET /projects/:projectId/tasks
    if (method === "GET") {
      const project = getProjectById(projectId, request.user!.userId);

      if (!project) {
        sendJson(response, 404, {
          error: "Project not found",
        });

        return true;
      }

      const tasks = getTasksByProjectId(projectId);

      sendJson(response, 200, tasks);

      return true;
    }

    // POST /projects/:projectId/tasks
    if (method === "POST") {
      const project = getProjectById(projectId, request.user!.userId);

      if (!project) {
        sendJson(response, 404, {
          error: "Project not found",
        });

        return true;
      }

      const body = await readRequestBody(request);

      try {
        const data = JSON.parse(body) as CreateTaskRequest;

        if (!data.title?.trim() || !data.description?.trim()) {
          sendJson(response, 400, {
            error: "Title and description are required",
          });

          return true;
        }

        const validStatuses = ["todo", "in_progress", "done"];
        const validPriorities = ["low", "medium", "high"];

        const status = data.status ?? "todo";
        const priority = data.priority ?? "medium";

        if (!validStatuses.includes(status)) {
          sendJson(response, 400, {
            error: "Invalid status",
          });

          return true;
        }

        if (!validPriorities.includes(priority)) {
          sendJson(response, 400, {
            error: "Invalid priority",
          });

          return true;
        }

        const task = createTask(projectId, {
          title: data.title,
          description: data.description,
          status,
          priority,
        });

        sendJson(response, 201, task);

        return true;
      } catch {
        sendJson(response, 400, {
          error: "Invalid JSON",
        });

        return true;
      }
    }
  }

  // --------------------------------
  // SINGLE TASK ROUTES
  // --------------------------------

  if (url?.startsWith("/tasks/")) {
    const taskId = url.split("/")[2];

    if (!taskId) {
      sendJson(response, 400, {
        error: "Task ID is required",
      });

      return true;
    }

    // GET /tasks/:id
      if (method === "GET") {
      const task = getTaskById(taskId);

      if (!task) {
        sendJson(response, 404, {
          error: "Task not found",
        });

        return true;
      }

      const project = getProjectById(
        task.project_id,
        request.user!.userId
      );

      if (!project) {
        sendJson(response, 403, {
          error: "Access denied",
        });

        return true;
      }

      sendJson(response, 200, task);

      return true;
    }

    // PUT /tasks/:id
    if (method === "PUT") {
      const existingTask = getTaskById(taskId);

      if (!existingTask) {
        sendJson(response, 404, {
          error: "Task not found",
        });

        return true;
      }

    const project = getProjectById(
      existingTask.project_id,
      request.user!.userId,
    );

    if (!project) {
      sendJson(response, 403, {
        error: "Access denied",
  });

      return true;
    }

      const body = await readRequestBody(request);

      try {
        const data = JSON.parse(body) as CreateTaskRequest;

        if (!data.title?.trim() || !data.description?.trim()) {
          sendJson(response, 400, {
            error: "Title and description are required",
          });

          return true;
        }

        const validStatuses = ["todo", "in_progress", "done"];
        const validPriorities = ["low", "medium", "high"];

        const status = data.status ?? "todo";
        const priority = data.priority ?? "medium";

        if (!validStatuses.includes(status)) {
          sendJson(response, 400, {
            error: "Invalid status",
          });

          return true;
        }

        if (!validPriorities.includes(priority)) {
          sendJson(response, 400, {
            error: "Invalid priority",
          });

          return true;
        }

        const updatedTask = updateTask(taskId, {
          title: data.title,
          description: data.description,
          status,
          priority,
        });

        sendJson(response, 200, updatedTask);

        return true;
      } catch {
        sendJson(response, 400, {
          error: "Invalid JSON",
        });

        return true;
      }
    }

    // DELETE /tasks/:id
    if (method === "DELETE") {
      const existingTask = getTaskById(taskId);

      if (!existingTask) {
        sendJson(response, 404, {
          error: "Task not found",
        });

        return true;
      }
        
      const project = getProjectById(
        existingTask.project_id,
        request.user!.userId
      );

    if (!project) {
      sendJson(response, 403, {
        error: "Access denied",
    });

      return true;
  }

      const deletedTask = deleteTask(taskId);

      sendJson(response, 200, {
        message: "Task deleted successfully",
        task: deletedTask,
      });

      return true;
    }
  }

  return false;
}