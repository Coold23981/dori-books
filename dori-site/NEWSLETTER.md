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

## Editorial style and reusable campaign format

Mandy's preferred newsletter is an informal studio note: chatty, warm, and easy to skim. Keep the main story high level and short. Add numbered notes at the end for readers who want sources, process details, definitions, or extra context. Each note can link to a journal entry, artwork, video, book, museum, or other useful source.

Create one branded campaign template in Brevo using the Botanical Journals palette: warm ivory background, deep botanical green headings and buttons, generous space, and a simple single-column layout. Keep each paragraph to a few short sentences. Use a mix of approved artwork photos, process drawings, and video stills. For video, link a still image to the hosted video rather than relying on an embedded player in the email. Add descriptive alt text to images and a visible unsubscribe link. Use only the confirmed subscribers list as recipients. The owner can then:

1. Open **Marketing → Campaigns → Create campaign → Email** in Brevo and reuse the template.
2. Replace the text and images, check every link, and preview on desktop and mobile.
3. Send a test to herself, read it in an inbox, then choose **Send now** or schedule it.

### Issue outline

Use this order as a starting point; omit any section that does not suit the issue.

1. **Subject:** a few conversational words, specific to the issue.
2. **Preview text:** one short line that adds a detail without repeating the subject.
3. **Greeting:** `Hello from the studio,` or a similarly natural opening.
4. **Short story:** one or two brief paragraphs about what Mandy has been making, noticing, trying, or wondering. Keep the main thread readable without opening any links.
5. **Visual pause:** one approved photograph or drawing with a short caption. A linked video still can point to a process clip.
6. **Another small note:** a second short thought, question, or update, optionally with another image.
7. **Sign-off:** a warm, personal close in Mandy's own voice.
8. **Notes to explore:** numbered footnotes matching markers in the story. Keep each note brief, and make useful titles or source names live links. The notes are optional reading, not a second long article.
9. **Footer:** studio identity, contact link, and Brevo's unsubscribe link.

Keep the opening and story readable in under a minute. A good issue can be just a few short paragraphs, one image, and two or three notes; use more only when the material calls for it. Do not invent artwork facts, process steps, quotations, or sources to fill the format.

### Copy-ready email drafts

Use these as starting copy in Brevo's visual editor. The owner should review the sender name, links, and artwork before sending.

**Confirmation template** — Subject: `Please confirm your Botanical Journals subscription`

> You asked to receive occasional studio emails from Botanical Journals by Mandy Lebides. Please confirm that you would like to receive notes about new work and collections. By confirming, you agree to receive these emails and can unsubscribe at any time.
>
> Button: **Confirm my subscription** (link it to Brevo's double opt-in URL, `{{ params.DOIurl }}`).

**Welcome automation** — Subject: `Welcome to the studio`

> Thank you for joining me. I share occasional notes about botanical drawings, hand bound journals, and new collections. You can explore the work at [the site address] and unsubscribe whenever you wish using the link below.
>
> Mandy

**Reusable campaign** — Subject: `[A few conversational words about this issue]`

Preview: `[One detail that makes the reader curious]`

> Hello from the studio,
>
> [A short, chatty opening about one thing Mandy has been making, noticing, or wondering.]
>
> [A second short paragraph that continues the thought. Add a numbered marker¹ where a reader can choose to explore more.]
>
> [Approved artwork or process image, with a brief caption and a link to its page.]
>
> [Optional linked video still, with a short sentence introducing the clip.]
>
> More, if you fancy it:
>
> 1. [Short note with a useful live link to a journal post or source.]
> 2. [Another optional note with a live link.]
>
> Thanks for being here,
>
> Mandy

Add the matching footnote marker in the story for each numbered note. Add Brevo's unsubscribe link in the welcome and campaign footers. Replace every bracketed placeholder before sending, and remove unused sections and markers.

Brevo Free currently allows 300 email sends per day and automation for up to 2,000 contacts. Confirmation, welcome, test, and campaign emails all consume sending capacity. If a full campaign cannot fit within the daily limit, upgrade before sending; Starter begins at US$9/month and Standard at US$18/month, excluding taxes and higher-volume tiers. Recheck Brevo pricing before purchasing.

## End-to-end acceptance check

- A valid submission with consent shows a check-your-inbox message and sends a confirmation email.
- An invalid email or missing consent is rejected. A provider failure does not show success.
- Clicking the email button opens `/newsletter/confirmed` and adds the address to the confirmed list.
- The new contact receives one welcome email. A second signup with the same address does not create a second welcome email.
- A campaign test arrives with correct links and an unsubscribe link. Unsubscribing excludes the address from the next campaign.
- The form remains hidden on a deployment missing any required Brevo configuration.

Brevo references: [double opt-in API](https://developers.brevo.com/reference/create-doi-contact), [welcome automation](https://help.brevo.com/hc/en-us/articles/15476926804370-Welcome-message-Send-welcome-emails-to-onboard-new-contacts), [campaign sending](https://help.brevo.com/hc/en-us/articles/4413566705298-Create-and-send-an-email-campaign), [plans](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans).
