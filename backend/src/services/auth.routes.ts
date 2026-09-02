import { registerUser } from "../services/auth.service";
import { sendJson, readRequestBody } from "../utils/http";

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export async function handleAuthRoute(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse,
): Promise<boolean> {
  const method = request.method;
  const url = request.url;

  // --------------------------------
  // REGISTER
  // --------------------------------

  if (method === "POST" && url === "/auth/register") {
    const body = await readRequestBody(request);

    try {
      const data = JSON.parse(body) as RegisterRequest;

      if (
        !data.username?.trim() ||
        !data.email?.trim() ||
        !data.password
      ) {
        sendJson(response, 400, {
          error: "Username, email and password are required",
        });

        return true;
      }

      if (data.password.length < 6) {
        sendJson(response, 400, {
          error: "Password must be at least 6 characters",
        });

        return true;
      }

      const user = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      sendJson(response, 201, {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Email already exists") {
          sendJson(response, 409, {
            error: error.message,
          });

          return true;
        }

        if (error.message === "Username already exists") {
          sendJson(response, 409, {
            error: error.message,
          });

          return true;
        }
      }

      sendJson(response, 400, {
        error: "Invalid request",
      });

      return true;
    }
  }

  return false;
}