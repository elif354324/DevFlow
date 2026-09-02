import db from "../db/database";

export interface DashboardStats {
  projects: number;
  tasks: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
}

export function getDashboardStats(userId: string): DashboardStats {
  const projectCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM projects
      WHERE user_id = ?
      `,
    )
    .get(userId) as { count: number };

  const taskCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN projects
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
      `,
    )
    .get(userId) as { count: number };

  const todoCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN projects
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
        AND tasks.status = 'todo'
      `,
    )
    .get(userId) as { count: number };

  const inProgressCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN projects
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
        AND tasks.status = 'in_progress'
      `,
    )
    .get(userId) as { count: number };

  const doneCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN projects
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
        AND tasks.status = 'done'
      `,
    )
    .get(userId) as { count: number };

  const highPriorityCount = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN projects
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
        AND tasks.priority = 'high'
      `,
    )
    .get(userId) as { count: number };

  return {
    projects: projectCount.count,
    tasks: taskCount.count,
    todo: todoCount.count,
    inProgress: inProgressCount.count,
    done: doneCount.count,
    highPriority: highPriorityCount.count,
  };
}