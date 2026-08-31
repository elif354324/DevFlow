import { randomUUID } from "node:crypto";
import db from "../db/database";

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export function getAllProjects() {
  return db
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
}

export function getProjectById(id: string): Project | undefined {
  return db
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
}

export function createProject(data: CreateProjectData): Project {
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

  return project;
}

export function updateProject(
  id: string,
  data: CreateProjectData,
): Project | undefined {
  const existingProject = getProjectById(id);

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
    `,
  ).run(
    data.name.trim(),
    data.description.trim(),
    id,
  );

  return getProjectById(id);
}

export function deleteProject(id: string): Project | undefined {
  const project = getProjectById(id);

  if (!project) {
    return undefined;
  }

  db.prepare(
    `
    DELETE FROM projects
    WHERE id = ?
    `,
  ).run(id);

  return project;
}