# Newsletter setup and owner guide

The website's signup form uses Brevo's double opt-in API. Brevo holds the subscriber list and sends the confirmation, welcome, and owner-written campaign emails. The form stays hidden while `NEXT_PUBLIC_NEWSLETTER_ENABLED` is `false`.

## One-time setup

1. Create the Brevo account in the site owner's name. Use the Free plan initially. The owner should keep access to the account and its recovery email.
2. Use a sender address on the site's own domain. Authenticate that domain in Brevo with the DNS records Brevo provides, and verify the sender. Wait until Brevo reports the domain as authenticated.
3. Create one list named **Botanical Journals — confirmed subscribers**. Record its numeric list ID.
4. Create a double opt-in email template with a clear confirmation button linked to Brevo's double opt-in URL. State the same consent wording as the website form. Keep promotional content out of this message. Record the template's numeric ID.
5. Create a Brevo API key for the website. Store it only as the hosted `BREVO_API_KEY` secret. Never put it in a `NEXT_PUBLIC_` variable, source file, or campaign template.
6. Set the hosted runtime values `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `BREVO_REDIRECT_URL`, and `SITE_URL`. Use `https://<public-site-domain>/newsletter/confirmed` for the redirect. `SITE_URL` must be the exact public origin used by visitors because the API checks the request origin.
7. Complete and approve the site's Privacy Policy, including the verified contact address and data request procedure. Set the **build variable** `NEXT_PUBLIC_NEWSLETTER_ENABLED=true` on staging, then rebuild and run the end-to-end check below. Keep the production flag `false` until that check passes; then set it to `true` and rebuild and deploy production.
8. In Brevo, create a **Welcome message** automation triggered when a contact is added to the confirmed subscribers list. Send one welcome email. Activate it before public signup opens. Leave re-entry off so re-added contacts do not receive another welcome email.

The existing `POST /api/newsletter` accepts `{ email, consent, website }` and returns a message. It asks Brevo to send a double opt-in email; it does not add someone to a campaign merely because they submitted the form. Brevo should add them to the selected list after confirmation. Verify this with a real inbox before launch.

## First campaign and repeat sends

Create one branded campaign template in Brevo with the sender, subject, preview text, a short opening, room for artwork images and links, and a visible unsubscribe link. Use only the confirmed subscribers list as recipients. The owner can then:

1. Open **Marketing → Campaigns → Create campaign → Email** in Brevo and reuse the template.
2. Replace the text and images, check every link, and preview on desktop and mobile.
3. Send a test to herself, read it in an inbox, then choose **Send now** or schedule it.

## Copy-ready email drafts

Use these as starting copy in Brevo's visual editor. The owner should review the sender name, links, and artwork before sending.

**Confirmation template** — Subject: `Please confirm your Botanical Journals subscription`

> You asked to receive occasional studio emails from Botanical Journals by Mandy Lebides. Please confirm that you would like to receive notes about new work and collections. By confirming, you agree to receive these emails and can unsubscribe at any time.
>
> Button: **Confirm my subscription** (link it to Brevo's double opt-in URL, `{{ params.DOIurl }}`).

**Welcome automation** — Subject: `Welcome to the studio`

> Thank you for joining me. I share occasional notes about botanical drawings, hand bound journals, and new collections. You can explore the work at [the site address] and unsubscribe whenever you wish using the link below.
>
> Mandy

**Reusable campaign** — Subject: `[A short note about the new work]`

> Hello from the studio,
>
> [Two or three sentences in Mandy's own words about this release or studio update.]
>
> [One approved artwork image, its verified title, and a link to its page.]
>
> Thank you for following along,
>
> Mandy

Add Brevo's unsubscribe link in the welcome and campaign footers. Replace every bracketed placeholder before sending.

Brevo Free currently allows 300 email sends per day and automation for up to 2,000 contacts. Confirmation, welcome, test, and campaign emails all consume sending capacity. If a full campaign cannot fit within the daily limit, upgrade before sending; Starter begins at US$9/month and Standard at US$18/month, excluding taxes and higher-volume tiers. Recheck Brevo pricing before purchasing.

## End-to-end acceptance check

- A valid submission with consent shows a check-your-inbox message and sends a confirmation email.
- An invalid email or missing consent is rejected. A provider failure does not show success.
- Clicking the email button opens `/newsletter/confirmed` and adds the address to the confirmed list.
- The new contact receives one welcome email. A second signup with the same address does not create a second welcome email.
- A campaign test arrives with correct links and an unsubscribe link. Unsubscribing excludes the address from the next campaign.
- The form remains hidden on a deployment missing any required Brevo configuration.

Brevo references: [double opt-in API](https://developers.brevo.com/reference/create-doi-contact), [welcome automation](https://help.brevo.com/hc/en-us/articles/15476926804370-Welcome-message-Send-welcome-emails-to-onboard-new-contacts), [campaign sending](https://help.brevo.com/hc/en-us/articles/4413566705298-Create-and-send-an-email-campaign), [plans](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans).
