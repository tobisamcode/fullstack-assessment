export async function GET(request: Request) {
  return new Response("API's are ready", {
    status: 200,
    headers: {},
  });
}
