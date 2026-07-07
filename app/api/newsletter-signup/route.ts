const BUTTONDOWN_SUBSCRIBERS_ENDPOINT = "https://api.buttondown.com/v1/subscribers";
const EMAIL_PATTERN = /^[a-zA-Z0-9.'_%+\-!]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

type SignupPayload = {
  email?: unknown;
  consent?: unknown;
};

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
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

  try {
    payload = (await request.json()) as SignupPayload;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const email = normalizeEmail(payload.email);
  if (!email) return json(400, { ok: false, error: "invalid_email" });
  if (payload.consent !== true) return json(400, { ok: false, error: "missing_consent" });

  const apiKey = process.env.BUTTONDOWN_API_KEY?.trim();
  if (!apiKey) return json(503, { ok: false, error: "newsletter_unavailable" });

  const response = await fetch(BUTTONDOWN_SUBSCRIBERS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (response.ok) return json(200, { ok: true });
  if (await isDuplicateSubscriberResponse(response)) {
    return json(200, { ok: true, duplicate: true });
  }

  return json(502, { ok: false, error: "newsletter_provider_error" });
}
