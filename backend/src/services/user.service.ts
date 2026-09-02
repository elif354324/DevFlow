import { randomUUID } from "node:crypto";
import db from "../db/database";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
}

export function getUserById(id: string): User | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        created_at
      FROM users
      WHERE id = ?
      `,
    )
    .get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        created_at
      FROM users
      WHERE email = ?
      `,
    )
    .get(email.trim().toLowerCase()) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        created_at
      FROM users
      WHERE username = ?
      `,
    )
    .get(username.trim()) as User | undefined;
}

export function createUser(data: CreateUserData): User {
  const user: User = {
    id: randomUUID(),
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    password_hash: data.password_hash,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `
    INSERT INTO users (
      id,
      username,
      email,
      password_hash,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
  ).run(
    user.id,
    user.username,
    user.email,
    user.password_hash,
    user.created_at,
  );

  return user;
}