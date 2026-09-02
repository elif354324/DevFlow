import { randomUUID } from "node:crypto";
import db from "../db/database";

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export function getAllProjects(userId: string) {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        description,
        created_at
      FROM projects
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
    )
    .all(userId);
}

export function getProjectById(
  id: string,
  userId: string,
): Project | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        description,
        created_at
      FROM projects
      WHERE id = ?
        AND user_id = ?
      `,
    )
    .get(id, userId) as Project | undefined;
}

export function createProject(
  userId: string,
  data: CreateProjectData,
): Project {
  const project: Project = {
    id: randomUUID(),
    name: data.name.trim(),
    description: data.description.trim(),
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `
    INSERT INTO projects (
      id,
      name,
      description,
      created_at,
      user_id
    )
    VALUES (?, ?, ?, ?, ?)
    `,
  ).run(
    project.id,
    project.name,
    project.description,
    project.created_at,
    userId,
  );

  return project;
}

export function updateProject(
  id: string,
  userId: string,
  data: CreateProjectData,
): Project | undefined {
  const existingProject = getProjectById(id, userId);

  if (!existingProject) {
    return undefined;
  }

  db.prepare(
    `
    UPDATE projects
    SET
      name = ?,
      description = ?
    WHERE id = ?
      AND user_id = ?
    `,
  ).run(
    data.name.trim(),
    data.description.trim(),
    id,
    userId,
  );

  return getProjectById(id, userId);
}

export function deleteProject(
  id: string,
  userId: string,
): Project | undefined {
  const project = getProjectById(id, userId);

  if (!project) {
    return undefined;
  }

  db.prepare(
    `
    DELETE FROM projects
    WHERE id = ?
      AND user_id = ?
    `,
  ).run(id, userId);

  return project;
}