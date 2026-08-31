import { createServer } from "node:http";
import db from "./db/database";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./services/project.service"; 
import {
  getTasksByProjectId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./services/task.service";
import { getDashboardStats } from "./services/dashboard.service";

interface CreateTaskRequest{
  title: string;
  description: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high"
}

// ------------------------------------
// HELPER FUNCTIONS
// ------------------------------------

function sendJson(
  response: import("node:http").ServerResponse,
  statusCode: number,
  data: unknown,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(data));
}


function readRequestBody(
  request: import("node:http").IncomingMessage,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      resolve(body);
    });

    request.on("error", reject);
  });
}

// ------------------------------------
// SERVER
// ------------------------------------

const server = createServer(async (request, response) => {
  try {
    const method = request.method;
    const url = request.url;

    // --------------------------------
    // HEALTH CHECK
    // --------------------------------

    if (method === "GET" && url === "/health") {
      sendJson(response, 200, {
        status: "ok",
      });

      return;
    }
    
    // --------------------------------
    // GET ALL PROJECTS
    // --------------------------------

    if (method === "GET" && url === "/projects") {
      const projects = getAllProjects();

      sendJson(response, 200, projects);

      return;
    }

    // --------------------------------
    // CREATE PROJECT
    // --------------------------------

    if (method === "POST" && url === "/projects") {
  const body = await readRequestBody(request);

  try {
    const data = JSON.parse(body) as {
      name: string;
      description: string;
    };

    if (!data.name?.trim() || !data.description?.trim()) {
      sendJson(response, 400, {
        error: "Name and description are required",
      });

      return;
    }

    const project = createProject({
      name: data.name,
      description: data.description,
    });

    sendJson(response, 201, project);

    return;
  } catch {
    sendJson(response, 400, {
      error: "Invalid JSON",
    });

    return;
  }
}

    // --------------------------------
    // TASK ROUTES
    // --------------------------------

    if (url?.match(/^\/projects\/[^/]+\/tasks$/)) {
      const projectId = url.split("/")[2];

      if (!projectId) {
        sendJson(response, 400, {
          error: "Project ID is required",
        });

        return;
      }

      // ------------------------------
      // GET PROJECT TASKS
      // ------------------------------

      if (method === "GET") {
        const project = getProjectById(projectId);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        const tasks = getTasksByProjectId(projectId);

        sendJson(response, 200, tasks);

        return;
      }

     // ------------------------------
      // CREATE TASK
      // ------------------------------

      if (method === "POST") {
        const project = getProjectById(projectId);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        const body = await readRequestBody(request);

        try {
          const data = JSON.parse(body) as CreateTaskRequest;

          if (!data.title?.trim() || !data.description?.trim()) {
            sendJson(response, 400, {
              error: "Title and description are required",
            });

            return;
          }

          const validStatuses = ["todo", "in_progress", "done"];
          const validPriorities = ["low", "medium", "high"];

          const status = data.status ?? "todo";
          const priority = data.priority ?? "medium";

          if (!validStatuses.includes(status)) {
            sendJson(response, 400, {
              error: "Invalid status",
            });

            return;
          }

          if (!validPriorities.includes(priority)) {
            sendJson(response, 400, {
              error: "Invalid priority",
            });

            return;
          }

          const task = createTask(projectId, {
            title: data.title,
            description: data.description,
            status,
            priority,
          });

          sendJson(response, 201, task);

          return;
        } catch {
          sendJson(response, 400, {
            error: "Invalid JSON",
          });

          return;
        }
      }
    }
// ------------------------------------
// SINGLE TASK ROUTES
// ------------------------------------

if (url?.startsWith("/tasks/")) {
  const taskId = url.split("/")[2];

  if (!taskId) {
    sendJson(response, 400, {
      error: "Task ID is required",
    });

    return;
  }

  // ------------------------------
  // GET TASK
  // ------------------------------

  if (method === "GET") {
    const task = getTaskById(taskId);

    if (!task) {
      sendJson(response, 404, {
        error: "Task not found",
      });

      return;
    }

    sendJson(response, 200, task);

    return;
  }

  // ------------------------------
  // UPDATE TASK
  // ------------------------------

  if (method === "PUT") {
   const existingTask = getTaskById(taskId);

    if (!existingTask) {
      sendJson(response, 404, {
        error: "Task not found",
      });

      return;
    }

    const body = await readRequestBody(request);

    try {
      const data = JSON.parse(body) as CreateTaskRequest;

      if (!data.title?.trim() || !data.description?.trim()) {
        sendJson(response, 400, {
          error: "Title and description are required",
        });

        return;
      }

      const validStatuses = ["todo", "in_progress", "done"];
      const validPriorities = ["low", "medium", "high"];

      const status = data.status ?? "todo";
      const priority = data.priority ?? "medium";

      if (!validStatuses.includes(status)) {
        sendJson(response, 400, {
          error: "Invalid status",
        });

        return;
      }

      if (!validPriorities.includes(priority)) {
        sendJson(response, 400, {
          error: "Invalid priority",
        });

        return;
      }

      const updatedTask = updateTask(taskId, {
        title: data.title,
        description: data.description,
        status,
        priority,
      });

      sendJson(response, 200, updatedTask);

      return;
    } catch {
      sendJson(response, 400, {
        error: "Invalid JSON",
      });

      return;
    }
  }

  // ------------------------------
  // DELETE TASK
  // ------------------------------

  if (method === "DELETE") {
    const existingTask = getTaskById(taskId);

    if (!existingTask) {
      sendJson(response, 404, {
        error: "Task not found",
      });

      return;
    }

    const deletedTask = deleteTask(taskId);

    sendJson(response, 200, {
      message: "Task deleted successfully",
      task: deletedTask,
    });

    return;
  }
}

// ------------------------------------
// DASHBOARD ROUTES
// ------------------------------------

if (method === "GET" && url === "/dashboard/stats") {
  const stats = getDashboardStats();

  sendJson(response, 200, stats);
  return; 
}


    // --------------------------------
    // PROJECT ID ROUTES
    // --------------------------------

    if (url?.startsWith("/projects/")) {
      const id = url.split("/")[2];

      if (!id) {
        sendJson(response, 400, {
          error: "Project ID is required",
        });

        return;
      }

      // ------------------------------
      // GET PROJECT
      // ------------------------------

      if (method === "GET") {
        const project = getProjectById(id);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        sendJson(response, 200, project);

        return;
      }

// ------------------------------
// UPDATE PROJECT
// ------------------------------

if (method === "PUT") {
  const project = getProjectById(id);

  if (!project) {
    sendJson(response, 404, {
      error: "Project not found",
    });

    return;
  }

  const body = await readRequestBody(request);

  try {
    const data = JSON.parse(body) as {
      name: string;
      description: string;
    };

    if (!data.name?.trim() || !data.description?.trim()) {
      sendJson(response, 400, {
        error: "Name and description are required",
      });

      return;
    }

    const updatedProject = updateProject(id, {
      name: data.name,
      description: data.description,
    });

    sendJson(response, 200, updatedProject);

    return;
  } catch {
    sendJson(response, 400, {
      error: "Invalid JSON",
    });

    return;
  }
}

           // ------------------------------
      // DELETE PROJECT
      // ------------------------------

      if (method === "DELETE") {
        const project = deleteProject(id);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        sendJson(response, 200, {
          message: "Project deleted successfully",
          project,
        });

        return;
      }
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