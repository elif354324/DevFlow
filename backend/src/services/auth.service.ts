import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  User,
} from "./user.service";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(
  data: RegisterData,
): Promise<User> {
  const existingEmail = getUserByEmail(data.email);

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const existingUsername = getUserByUsername(data.username);

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  return createUser({
    username: data.username,
    email: data.email,
    password_hash,
  });
}

export async function loginUser(
  data: LoginData,
): Promise<User | undefined> {
  const user = getUserByEmail(data.email);

  if (!user) {
    return undefined;
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.password_hash,
  );

  if (!passwordMatches) {
    return undefined;
  }

  return user;
}