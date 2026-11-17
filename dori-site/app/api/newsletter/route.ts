import { config, json, sameOrigin, validEmail } from "../../../lib/server";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json("Request origin was not accepted.", 403);

  const c = config();
  if (!c.SITE_URL || !c.BREVO_API_KEY || !c.BREVO_LIST_ID || !c.BREVO_DOI_TEMPLATE_ID || !c.BREVO_REDIRECT_URL) {
    return json("Newsletter subscriptions are not active yet.", 503);
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return json("Invalid request.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return json("Invalid request.");

  const { email, consent, website } = data as Record<string, unknown>;
  if (website) return json("Request not accepted.");
  if (!validEmail(email) || consent !== true) {
    return json("Enter a valid email address and confirm consent.");
  }

  const listId = Number(c.BREVO_LIST_ID);
  const templateId = Number(c.BREVO_DOI_TEMPLATE_ID);
  if (!Number.isInteger(listId) || listId <= 0 || !Number.isInteger(templateId) || templateId <= 0) {
    return json("Newsletter configuration is incomplete.", 503);
  }
  try {
    const redirect = new URL(c.BREVO_REDIRECT_URL);
    if (redirect.origin !== new URL(c.SITE_URL).origin || redirect.pathname !== "/newsletter/confirmed") {
      return json("Newsletter configuration is incomplete.", 503);
    }
  } catch {
    return json("Newsletter configuration is incomplete.", 503);
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "api-key": c.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        includeListIds: [listId],
        templateId,
        redirectionUrl: c.BREVO_REDIRECT_URL,
      }),
    });
    if (res.ok) return Response.json({ message: "Please check your inbox to confirm your subscription." });
    if (res.status === 400) {
      const body = await res.text();
      if (body.toLowerCase().includes("already")) {
        return Response.json({ message: "If this address is eligible, a confirmation email will arrive shortly." });
      }
    }
    return json("The newsletter service could not accept this request. Please try later.", 502);
  } catch {
    return json("The newsletter service is unavailable.", 502);
  }
}
