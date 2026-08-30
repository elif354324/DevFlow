import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface ProjectRequest {
  name: string;
  description: string;
}

interface CreateTaskRequest{
  title: string;
  description: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high"
}

// ------------------------------------
// DATABASE
// ------------------------------------

const db = new Database("devflow.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE
    )
  `);

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

function getProject(id: string): Project | undefined {
  const project = db
    .prepare(
      `
      SELECT
        id,
        name,
        description
      FROM projects
      WHERE id = ?
    `,
    )
    .get(id) as Project | undefined;

  return project;
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
      const projects = db
        .prepare(
          `
          SELECT
            id,
            name,
            description
          FROM projects
          ORDER BY created_at DESC
        `,
        )
        .all();

      sendJson(response, 200, projects);

      return;
    }

    // --------------------------------
    // CREATE PROJECT
    // --------------------------------

    if (method === "POST" && url === "/projects") {
      const body = await readRequestBody(request);

      try {
        const data = JSON.parse(body) as ProjectRequest;

        if (!data.name?.trim() || !data.description?.trim()) {
          sendJson(response, 400, {
            error: "Name and description are required",
          });

          return;
        }

        const project: Project = {
          id: randomUUID(),
          name: data.name.trim(),
          description: data.description.trim(),
        };

        db.prepare(
          `
          INSERT INTO projects (
            id,
            name,
            description,
            created_at
          )
          VALUES (?, ?, ?, ?)
        `,
        ).run(
          project.id,
          project.name,
          project.description,
          new Date().toISOString(),
        );

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

    if(url?.match(/^\/projects\/[^/]+\/tasks$/)) {
      const projectId = url.split("/")[2];

      if(!projectId){
        sendJson(response, 400, {
          error: "Project ID is required",
        });
        return;
      }

      // ------------------------------
      // GET PROJECT TASKS
      // ------------------------------

      if(method === "GET"){
        const project = getProject(projectId);

        if(!project){
          sendJson(response, 400, {
            error: "Project not found",
          });

          return;
        }

        const tasks = db
        .prepare(
          `
          SELECT 
          id,
          project_id,
          title,
          description,
          status,
          priority,
          created_at
          FROM tasks
          WHERE project_id = ?
          ORDER BY created_at DESC
          `,
        )
        .all(projectId);
      sendJson(response, 200, tasks);

      return;
      }

      // ------------------------------
      // CREATE TASK
      // ------------------------------

      if(method === "POST"){
        const project = getProject(projectId);

        if(!project) {
          sendJson(response, 400, {
            error: "Project not found",
          });

          return;
        }

        const body = await readRequestBody(request);

        try{
          const data = JSON.parse(body) as CreateTaskRequest;

          if(!data.title?.trim() || !data.description?.trim()){
            sendJson(response, 400, {
              error: "Title and description are required",
            });

            return;
          }

          const validStatuses = ["todo", "in_progress", "done"];
          const validPriorities = ["low", "medium", "high"];

          const status = data.status ?? "todo";
          const priority = data.priority ?? "medium";

          if(!validStatuses.includes(status)){
            sendJson(response, 400, {
              error: "Invalid status",
            });
            
            return;
          }

          const task = {
            id: randomUUID(),
            project_id: projectId,
            title: data.title.trim(),
            description: data.description.trim(),
            status,
            priority,
            created_at: new Date().toISOString(),
          };

          db.prepare(
            `
            INSERT INTO tasks (
            id,
            project_id,
            title,
            description,
            status,
            priority,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          ).run(
            task.id,
            task.project_id,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.created_at,
          );

          sendJson(response, 201, task);

          return;
        } catch{
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
    const task = db
      .prepare(
        `
        SELECT
          id,
          project_id,
          title,
          description,
          status,
          priority,
          created_at
        FROM tasks
        WHERE id = ?
        `,
      )
      .get(taskId);

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
    const existingTask = db
      .prepare(
        `
        SELECT *
        FROM tasks
        WHERE id = ?
        `,
      )
      .get(taskId);

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

      db.prepare(
        `
        UPDATE tasks
        SET
          title = ?,
          description = ?,
          status = ?,
          priority = ?
        WHERE id = ?
        `,
      ).run(
        data.title.trim(),
        data.description.trim(),
        status,
        priority,
        taskId,
      );

      const updatedTask = db
        .prepare(
          `
          SELECT
            id,
            project_id,
            title,
            description,
            status,
            priority,
            created_at
          FROM tasks
          WHERE id = ?
          `,
        )
        .get(taskId);

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
    const existingTask = db
      .prepare(
        `
        SELECT
          id,
          project_id,
          title,
          description,
          status,
          priority,
          created_at
        FROM tasks
        WHERE id = ?
        `,
      )
      .get(taskId);

    if (!existingTask) {
      sendJson(response, 404, {
        error: "Task not found",
      });

      return;
    }

    db.prepare(
      `
      DELETE FROM tasks
      WHERE id = ?
      `,
    ).run(taskId);

    sendJson(response, 200, {
      message: "Task deleted successfully",
      task: existingTask,
    });

    return;
  }
}

  // ------------------------------------
// DASHBOARD ROUTES
// ------------------------------------

if (method === "GET" && url === "/dashboard/stats") {
  const projectCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM projects
      `,
    )
    .get() as { count: number };

  const taskCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      `,
    )
    .get() as { count: number };

  const todoCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'todo'
      `,
    )
    .get() as { count: number };

  const inProgressCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'in_progress'
      `,
    )
    .get() as { count: number };

  const doneCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'done'
      `,
    )
    .get() as { count: number };

  const highPriorityCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      WHERE priority = 'high'
      `,
    )
    .get() as { count: number };

  sendJson(response, 200, {
    projects: projectCount.count,
    tasks: taskCount.count,
    todo: todoCount.count,
    inProgress: inProgressCount.count,
    done: doneCount.count,
    highPriority: highPriorityCount.count,
  });

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
        const project = getProject(id);

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
        const project = getProject(id);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        const body = await readRequestBody(request);

        try {
          const data = JSON.parse(body) as ProjectRequest;

          if (!data.name?.trim() || !data.description?.trim()) {
            sendJson(response, 400, {
              error: "Name and description are required",
            });

            return;
          }

          db.prepare(
            `
            UPDATE projects
            SET
              name = ?,
              description = ?
            WHERE id = ?
          `,
          ).run(
            data.name.trim(),
            data.description.trim(),
            id,
          );

          const updatedProject = getProject(id);

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
        const project = getProject(id);

        if (!project) {
          sendJson(response, 404, {
            error: "Project not found",
          });

          return;
        }

        db.prepare(
          `
          DELETE FROM projects
          WHERE id = ?
        `,
        ).run(id);

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