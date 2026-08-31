import { randomUUID } from "node:crypto";
import db from "../db/database";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
}

// ID'si verilen projeye ait tüm taskları döndürür.
export function getTasksByProjectId(projectId: string): Task[] {
  return db
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
    .all(projectId) as Task[];
}

// Tek bir task'ı ID'si ile döndürür. Eğer task bulunamazsa undefined döner.
export function getTaskById(id: string): Task | undefined {
  return db
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
    .get(id) as Task | undefined;
}

// Yeni bir task oluşturur ve oluşturulan task'ı döndürür.
export function createTask(
  projectId: string,
  data: CreateTaskData,
): Task {
  const status = data.status ?? "todo";
  const priority = data.priority ?? "medium";

  const task: Task = {
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

  return task;
}
 
//ID'si verilen task'ı günceller ve güncellenmiş task'ı döndürür. Eğer task bulunamazsa undefined döner.
export function updateTask(
  id: string,
  data: CreateTaskData,
): Task | undefined {
  const existingTask = getTaskById(id);

  if (!existingTask) {
    return undefined;
  }

  const status = data.status ?? "todo";
  const priority = data.priority ?? "medium";

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
    id,
  );

  return getTaskById(id); 
}

// ID'si verilen task'ı siler ve silinen task'ı döndürür. Eğer task bulunamazsa undefined döner.
export function deleteTask(id: string): Task | undefined {
  const task = getTaskById(id);

  if (!task) {
    return undefined;
  }

  db.prepare(
    `
    DELETE FROM tasks
    WHERE id = ?
    `,
  ).run(id);

  return task;
}