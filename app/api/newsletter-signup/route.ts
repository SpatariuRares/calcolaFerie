const BUTTONDOWN_SUBSCRIBERS_ENDPOINT = "https://api.buttondown.com/v1/subscribers";
const EMAIL_PATTERN = /^[a-zA-Z0-9.'_%+\-!]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const MAX_BODY_BYTES = 2_048;
const PROVIDER_TIMEOUT_MS = 8_000;

type SignupPayload = {
  email?: unknown;
  consent?: unknown;
};

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizeEmail(email: unknown) {
  if (typeof email !== "string") return null;

  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) return null;

  return normalized;
}

async function isDuplicateSubscriberResponse(response: Response) {
  if (response.status === 409) return true;
  if (response.status !== 400) return false;

  const body = await response.clone().text();
  return /already|exist/i.test(body);
}

export async function POST(request: Request) {
  let payload: SignupPayload;

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { ok: false, error: "unsupported_media_type" });
  }

  try {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: "payload_too_large" });
    }
    payload = JSON.parse(new TextDecoder().decode(body)) as SignupPayload;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const email = normalizeEmail(payload.email);
  if (!email) return json(400, { ok: false, error: "invalid_email" });
  if (payload.consent !== true) return json(400, { ok: false, error: "missing_consent" });

  const apiKey = process.env.BUTTONDOWN_API_KEY?.trim();
  if (!apiKey) return json(503, { ok: false, error: "newsletter_unavailable" });

  let response: Response;
  try {
    response = await fetch(BUTTONDOWN_SUBSCRIBERS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, type: "unactivated" }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  } catch {
    return json(502, { ok: false, error: "newsletter_provider_error" });
  }

  if (response.ok) return json(200, { ok: true });
  if (await isDuplicateSubscriberResponse(response)) {
    return json(200, { ok: true, duplicate: true });
  }

  return json(502, { ok: false, error: "newsletter_provider_error" });
}
