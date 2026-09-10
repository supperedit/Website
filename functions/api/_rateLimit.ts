const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 60;

export async function isRateLimited(
  request: Request,
  kv: KVNamespace | undefined,
  routeName: string,
): Promise<boolean> {
  if (!kv) return false;

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const windowStart = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `rl:${routeName}:${ip}:${windowStart}`;

  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  await kv.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS * 2 });
  return false;
}

export function rateLimitResponse(): Response {
  return new Response(JSON.stringify({ error: "Zu viele Anfragen, bitte kurz warten." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(WINDOW_SECONDS) },
  });
}
