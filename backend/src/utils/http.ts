export function sendJson(
  response: import("node:http").ServerResponse,
  statusCode: number,
  data: unknown,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(data));
}

export function readRequestBody(
  request: import("node:http").IncomingMessage,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      resolve(body);
    });

    request.on("error", reject);
  });
}