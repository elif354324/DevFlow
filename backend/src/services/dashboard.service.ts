import db from "../db/database";

export interface DashboardStats {
  projects: number;
  tasks: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
}

export function getDashboardStats(): DashboardStats {
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

  return {
    projects: projectCount.count,
    tasks: taskCount.count,
    todo: todoCount.count,
    inProgress: inProgressCount.count,
    done: doneCount.count,
    highPriority: highPriorityCount.count,
  };
}