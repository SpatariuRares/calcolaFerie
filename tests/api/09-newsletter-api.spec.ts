import { expect, test } from "@playwright/test";
import { POST } from "../../app/api/newsletter-signup/route";

const originalApiKey = process.env.BUTTONDOWN_API_KEY;
const originalPublicApiKey = process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY;
const originalFetch = globalThis.fetch;

function request(body: unknown) {
  return new Request("http://localhost/api/newsletter-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function rawRequest(body: string, contentType = "application/json") {
  return new Request("http://localhost/api/newsletter-signup", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

function installFetch(response: Response) {
  const calls: Parameters<typeof fetch>[] = [];
  globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
    calls.push(args);
    return response.clone();
  };

  return calls;
}

test.describe("POST /api/newsletter-signup", () => {
  test.beforeEach(() => {
    process.env.BUTTONDOWN_API_KEY = "server-secret";
    delete process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY;
  });

  test.afterEach(() => {
    process.env.BUTTONDOWN_API_KEY = originalApiKey;
    process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY = originalPublicApiKey;
    globalThis.fetch = originalFetch;
  });

  test("validates email and consent before contacting Buttondown", async () => {
    const calls = installFetch(new Response(null, { status: 201 }));
    const invalidEmail = await POST(request({ email: "not-an-email", consent: true }));
    const missingConsent = await POST(request({ email: "rares@example.com", consent: false }));

    expect(invalidEmail.status).toBe(400);
    expect(missingConsent.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  test("rejects unsupported content types and oversized payloads", async () => {
    const calls = installFetch(new Response(null, { status: 201 }));

    const unsupported = await POST(rawRequest("email=x", "application/x-www-form-urlencoded"));
    const oversized = await POST(rawRequest(JSON.stringify({ padding: "x".repeat(2_100) })));

    expect(unsupported.status).toBe(415);
    expect(oversized.status).toBe(413);
    expect(calls).toHaveLength(0);
  });

  test("subscribes through Buttondown using the server-only API key and default double opt-in", async () => {
    const calls = installFetch(
      new Response(JSON.stringify({ id: "subscriber_1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY = "public-key-that-must-not-be-used";

    const response = await POST(request({ email: "Rares@Example.com ", consent: true }));

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("https://api.buttondown.com/v1/subscribers");
    expect(calls[0][1]).toMatchObject({
      method: "POST",
      headers: {
        Authorization: "Token server-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: "rares@example.com", type: "unactivated" }),
    });
  });

  test("does not expose or depend on a NEXT_PUBLIC Buttondown API key", async () => {
    const calls = installFetch(new Response(null, { status: 201 }));
    delete process.env.BUTTONDOWN_API_KEY;
    process.env.NEXT_PUBLIC_BUTTONDOWN_API_KEY = "public-key";

    const response = await POST(request({ email: "rares@example.com", consent: true }));

    expect(response.status).toBe(503);
    expect(calls).toHaveLength(0);
  });

  test("handles duplicate Buttondown responses without crashing", async () => {
    installFetch(
      new Response(JSON.stringify({ detail: "Subscriber already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await POST(request({ email: "already@example.com", consent: true }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, duplicate: true });
  });

  test("returns a controlled error when Buttondown is unreachable", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("network unavailable");
    };

    const response = await POST(request({ email: "rares@example.com", consent: true }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "newsletter_provider_error",
    });
  });
});
