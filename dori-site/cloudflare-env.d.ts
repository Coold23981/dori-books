declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_WEBHOOK_SECRET?: string;
    SITE_URL?: string;
    ADMIN_USER_ID?: string;
    BREVO_API_KEY?: string;
    BREVO_LIST_ID?: string;
    BREVO_DOI_TEMPLATE_ID?: string;
    BREVO_REDIRECT_URL?: string;
    CONTACT_TO_EMAIL?: string;
    CONTACT_FROM_EMAIL?: string;
    TURNSTILE_SECRET_KEY?: string;
  }
}
