import db from "../db/database";

export interface DashboardStats {
  projects: number;
  tasks: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
  completionRate : number;
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

  const completionRate =
  taskCount.count === 0
    ? 0
    : Math.round(
        (doneCount.count / taskCount.count) * 100,
      );

return {
  projects: projectCount.count,
  tasks: taskCount.count,
  todo: todoCount.count,
  inProgress: inProgressCount.count,
  done: doneCount.count,
  highPriority: highPriorityCount.count,
  completionRate,
};
}

export interface ProjectProgress {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export function getProjectProgress(
  userId: string,
): ProjectProgress[] {
  const projects = db
    .prepare(
      `
      SELECT
        projects.id,
        projects.name,
        COUNT(tasks.id) AS totalTasks,
        SUM(
          CASE
            WHEN tasks.status = 'done' THEN 1
            ELSE 0
          END
        ) AS completedTasks
      FROM projects
      LEFT JOIN tasks
        ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
      GROUP BY projects.id, projects.name
      ORDER BY projects.created_at DESC
      `,
    )
    .all(userId) as {
      id: string;
      name: string;
      totalTasks: number;
      completedTasks: number;
    }[];

  return projects.map((project) => {
    const completionRate =
      project.totalTasks === 0
        ? 0
        : Math.round(
            (project.completedTasks /
              project.totalTasks) *
              100,
          );

    return {
      id: project.id,
      name: project.name,
      totalTasks: project.totalTasks,
      completedTasks: project.completedTasks,
      completionRate,
    };
  });
}