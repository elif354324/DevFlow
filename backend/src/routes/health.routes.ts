import { IncomingMessage, ServerResponse } from "node:http";

export function handleHealthRoute(
  method: string | undefined,
  url: string | undefined,
  response: ServerResponse,
): boolean {
  if (method === "GET" && url === "/health") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");

    response.end(
      JSON.stringify({
        status: "ok",
      }),
    );

    return true;
  }

  return false;
}