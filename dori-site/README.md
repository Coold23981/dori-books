# Botanical Journals

A provisional botanical art market and commerce codebase for Mandy Lebides. The market starts with four categories: original A4 botanical drawings, original mini botanical canvases, hand bound Japanese botanical journals and hand drawn botanical bookmarks. No individual artworks, prices, policies or achievements are fabricated. The catalogue starts empty and checkout remains unavailable until genuine stock, shipping and PayFast credentials are configured. Publishing the source to GitHub does not by itself configure production data, secrets or payments.

## Architecture

- Vinext/React/TypeScript on Cloudflare Workers, with Cloudflare D1 for catalogue, orders and stock reservations, and R2 for artwork images. The starter supplies the local development runtime.
- PayFast custom hosted checkout. The server generates a signed payment form; the passphrase remains server-only. The `notify` endpoint checks signature, merchant, total and PayFast's validation endpoint before changing order status. A return URL never marks an order paid.
- D1 triggers atomically reject over-reservation of one-off works or editions. Orders reserve stock for 30 minutes; late payment confirmation fails closed if another paid order or live reservation has claimed the stock. Such payments require manual merchant reconciliation and refund. This edge case must be exercised with the merchant's sandbox before launch.
- Genuine payments that cannot be applied because their reservation expired are recorded as `payment_review` for manual refund or reconciliation; they are never shown as confirmed acquisitions.
- Browser session storage holds only the bag display. Prices and availability are read again from D1 at checkout.
- Studio administration uses Sites' signed-in identity and an `ADMIN_USER_ID` allowlist in local preview. A standalone public Cloudflare Worker has no trusted Sites identity proxy, so its admin routes stay locked until a production authentication integration is implemented. The local admin can manage artworks, collection releases, journal entries, shipping zones and images; orders are read-only.
- Brevo double opt-in newsletter and transactional contact delivery remain disabled until configured. The contact form also requires Turnstile. No form claims success without a provider acceptance response.

## Local development

Requires Node.js 22.13+, npm, and a working npm registry connection.

1. `npm ci`
2. Copy `.env.example` to `.dev.vars`, set `SITE_URL` to the local URL and `ADMIN_USER_ID=local_seedy` for the starter's local mock sign-in. Leave payment, email and Turnstile fields blank until configured.
3. `npm run build` to generate the local Worker config.
4. Apply `drizzle/0000_initial.sql` to a fresh local D1: `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config wrangler.local.jsonc --persist-to .wrangler/state --file drizzle/0000_initial.sql`. Then apply `drizzle/0001_market_categories.sql` with the same command and its filename. For an existing local database, apply only the new `0001` migration.
5. `npm run dev` and open the printed local URL. Sign in locally at `/signin-with-chatgpt?return_to=/admin` for the admin.

The initial SQL migration is intentionally hand-authored because it contains atomic inventory triggers and a stock view. Treat it as immutable after first application. Future schema changes should use a new numbered migration; do not replay the initial migration against an existing database.

## Cloudflare Workers Builds settings

Use build root `/dori-site`, build command `npm run build`, and deploy command `npx wrangler deploy`. The build writes `dist/server/wrangler.json`, which Wrangler uses for deployment. A build token belongs in Cloudflare's credential setting, never in the repository or build variables.

Without production storage, the public site deploys with an empty catalogue; admin image uploads, catalogue editing and checkout are unavailable. To prepare storage, create a D1 database and enable R2 in the Cloudflare account, create an R2 bucket, then set build variables `DORI_D1_DATABASE_ID` (the real database UUID), `DORI_D1_DATABASE_NAME` (defaults to `dori-books`) and `DORI_R2_BUCKET_NAME` (the real bucket name). Rebuild after setting them. Apply `drizzle/0000_initial.sql` and then `drizzle/0001_market_categories.sql` to the remote D1 database. Add a trusted production admin authentication system before managing content on the public Worker. The placeholder D1 ID and `site-creator-r2` bucket are for local development only and are never included in a production build.

Server secrets such as the PayFast passphrase and Brevo API key belong in runtime secrets. Set `NEXT_PUBLIC_CHECKOUT_ENABLED=true` only when genuine stock, shipping and PayFast settings are ready and the sandbox checkout has passed. Until then, the checkout page links back to the collections.

## Adding works and releases

The Market page and its four category pages are driven by `market_categories`. In `/admin`, use **categories** to add a page or turn off **active** to remove it from the Market and homepage without deleting its products. Category slugs are used in URLs and in the artwork `category` field. Create each artwork with its verified slug, category slug, description, price in **cents**, edition size and stock. Unique works should have `edition_size=1` and `stock_total=1`. A limited edition needs its actual quantity, not a generic 10–20 placeholder. Upload artwork images and save their returned keys in the desired display order. Keep `status=draft` until photography and all details are approved; set `featured` to display a work on the homepage. Add a shipping zone and activate it only after rates and destinations are confirmed. D1 guards against reducing stock beneath existing paid orders and active reservations.

## Payment setup and test plan

Create a PayFast sandbox merchant account and set a passphrase. Put the sandbox credentials in server-side runtime variables; do not commit them. `SITE_URL` must be a public HTTPS origin for PayFast ITN calls during sandbox testing. A private Sites preview cannot receive anonymous PayFast notifications, so use a dedicated public staging origin after the rest of the project is approved. Test successful, cancelled and delayed payments, duplicate ITNs, concurrent purchase of one unique work, edition quantity boundaries, reservation expiry and manual refund handling. Then switch `PAYFAST_MODE=live` and production credentials only after the merchant approves launch. PayFast requires merchant ID and merchant key in the customer POST form; the signing passphrase never goes to the browser.

## Forms

Brevo requires an API key, newsletter list ID, double opt-in template ID and confirmation redirect URL. Set `NEXT_PUBLIC_NEWSLETTER_ENABLED=true` only when configured. Contact requires a verified Brevo sender and destination plus Cloudflare Turnstile public/secret keys. Set `NEXT_PUBLIC_CONTACT_ENABLED=true` only after both the email service and Turnstile are configured. Until then, the site shows useful collection and process links in place of inactive forms. Set the real Instagram URL in `NEXT_PUBLIC_INSTAGRAM_URL` to show that link.

See [NEWSLETTER.md](NEWSLETTER.md) for account setup, the owner's campaign workflow, costs, and end-to-end checks.

## Checks

Run `npm run build`, `npx tsc --noEmit`, and `node scripts/check-inventory.mjs`, then test all routes on mobile and desktop. Run the PayFast sandbox scenarios above before any public launch. Automated full checkout tests are not included because the merchant account and external callbacks are not available in this workspace.

## Launch checklist

- [ ] Confirm brand name, logo and approved editorial copy.
- [ ] Supply approved biography, portrait, genuine artwork and process photography.
- [ ] Supply verified artwork descriptions, dimensions, materials, edition sizes, prices and inventory.
- [ ] Approve shipping destinations, prices, dispatch expectations and packaging.
- [ ] Provide PayFast sandbox and live merchant credentials; complete sandbox and live validation.
- [ ] Provide verified studio contact details and Instagram URL.
- [ ] Configure Brevo, double opt-in, sender verification and Turnstile.
- [ ] Approve Privacy, Terms, Shipping and Returns pages with South African legal review, including POPIA and consumer rights.
- [ ] Choose a public domain and hosting plan, configure DNS, HTTPS and public access.
- [ ] Set `SITE_URL` to the approved production URL and replace the draft no-index robots directive after approval.
- [ ] Test keyboard access, mobile layout, email delivery, order fulfilment and refund procedures.

## Sources for integrations

- [PayFast custom integration](https://developers.payfast.co.za/docs)
- [PayFast ITN validation](https://developers.payfast.co.za/docs/itn-instant-transaction-notification/)
- [Brevo double opt-in](https://developers.brevo.com/reference/create-doi-contact)
- [Brevo transactional email](https://developers.brevo.com/reference/send-transac-email)
