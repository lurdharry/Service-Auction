export function responseHandler(body, statusCode) {
  return {
    body: JSON.stringify({ error: statusCode >= 400, ...body }),
    // headers: { "Content-Type": "application/json", ...headers },
    statusCode,
  };
}
