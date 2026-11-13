# Admin setup, publishing, and operations

Open the **three-line menu (☰)** in the public header, then choose **Admin login**, or open **`/admin`** directly in a new tab. The link is shown only inside the opened menu, on desktop and mobile—not as a standalone header button or footer link. Create your password once with the private setup link, then use `/admin` for future sign-ins.

The editor uses a real server. It is not a password check in frontend code and does not save content in localStorage.

## What it controls

| Area               | Controls                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Profile & home     | Name, role, location, email, social/canonical URLs, hero and résumé summaries, build-path steps                                                                                                                                                        |
| Projects           | Add/edit/duplicate/remove, order, visibility, featured status, category, brief description, full narratives, tags, diagram stages, demo/source availability, verification notes, simple project image URL/alt, genuine capture URL/alt/dimensions/date |
| Sections & copy    | Navigation labels, section order/visibility, branding, availability, headings, introductions, About/contact/footer copy                                                                                                                                |
| Capabilities       | Pillars, subtitles, skill lists, order, add/remove                                                                                                                                                                                                     |
| About & experience | About paragraphs, engineering principles, ventures/milestones, organizations, descriptions, highlights, order                                                                                                                                          |
| Appearance         | Default theme, separate dark/light accents, original-motion toggle, résumé toggle, page/social description                                                                                                                                             |
| Overview           | Draft/published status, private preview, JSON backup/import, published/factory recovery                                                                                                                                                                |
| Security           | Password change, session/storage information, sign out                                                                                                                                                                                                 |

Home stays first and visible. Input limits and accessibility-oriented accent validation are enforced on the server as well as in the editor. New projects start hidden. Existing factory content retains all eleven projects, with the four flagships featured.

## Local owner setup

```bash
npm ci
npm run dev
```

The complete server runs on port 3000. It creates `.portfolio-data/` with private permissions and a randomly generated bootstrap key. Open the terminal's **`/admin#setup=…`** link in a new top-level browser tab, using the preview's origin if working in Arena. Choose a strong unique passphrase of 14–128 characters and keep it in a password manager.

- The fragment key is not sent as a URL query string or included in public page content. The admin removes it from the address bar and sends it once in a dedicated same-origin request header.
- A correct bootstrap key is required before any account exists. A public visitor cannot claim the account by visiting `/admin`.
- Setup can only create an absent auth record; once configured, reusing the link is rejected.
- There is no shared/default admin password. The browser does not receive the stored password hash or server signing secret.

Development and production-preview commands both include the same API. `npm run preview -- --port 3000` serves a built site. Plain `vite preview` is insufficient and is not the project's preview command anymore.

Local data persists across server restarts on that machine, not across unrelated machines or hosting providers. The directory is ignored by Git and must never be put in `public/`, `dist/`, a static upload, or a content backup.

## Durable Vercel setup

This repository includes Vercel Node entry points under `api/` and shared server code under `server/`. A pure static deployment cannot implement shared publishing.

1. Deploy this repository to the intended Vercel project using Node 22 LTS or a compatible newer LTS version. Keep `vercel.json`, the `api/` folder, and the generated page-template inclusion.
2. In Vercel's Storage dashboard, create/attach a **PRIVATE Vercel Blob store**. Do **not** select a public store: it will hold drafts, password hashes, session signing material, and rate-limit counters. Attaching it supplies the server variable **`BLOB_READ_WRITE_TOKEN`**.
3. Generate a separate one-time setup key on your own machine:
   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```
   Save it as a server-only encrypted/sensitive **`ADMIN_SETUP_KEY`** environment variable (at least 32 characters), then redeploy. Never prefix either secret with `VITE_`, include it in Git, or paste it into a chat.
4. Open **`https://YOUR_DEPLOYMENT/admin#setup=YOUR_SETUP_KEY`** privately. Choose the admin password in the page, not in source code or environment variables.
5. Verify that Security reports **private shared storage**, save a draft, preview it, and publish a harmless change. Verify the public page from a signed-out browser and after a redeploy.
6. Once the owner account exists, remove the bootstrap environment variable and redeploy if desired. Authentication remains in the private store; an absent bootstrap variable does not reset the account.

### Environment separation

The default Blob namespace is:

```text
portfolio-cms/<VERCEL_ENV or development>/v1/
```

Production and preview therefore do not edit the same content by default, even if they use one private store. Optionally set **`PORTFOLIO_BLOB_PREFIX`** to a distinct namespace for each site/environment. Never point a development or preview deployment at the production namespace unless you intentionally want it to edit production.

No private Blob store or Vercel secrets were provisioned in this coding session. The available Vercel connector has project/deployment/environment operations, but no Blob provisioning tool. The local preview is functional; **durable Vercel publishing is configuration-dependent and was not live-tested against a real Blob store**.

### Fail-closed behavior

On Vercel without a Blob token, public factory content is still readable, but setup/writes return **503**, and `/admin` explains what must be connected. The app never falls back to Vercel's ephemeral filesystem for saving content. If configured storage later becomes unavailable, operations report an error rather than claiming a save succeeded; a new public page reports temporary unavailability rather than silently reviving factory content.

`.env.example` lists supported variables. Locally, the server loads `.env` and then `.env.local`; keep actual values out of the repository.

## Publishing and conflict recovery

- **Working copy:** unsaved, in-memory edits in the admin tab. Leaving warns before discarding them.
- **Save draft:** a private, durable server write. It does not change `/api/site` or public pages.
- **Preview:** saves the working copy if needed and opens an authenticated `/?preview=draft` view. An anonymous visitor cannot use the URL to retrieve the draft. Draft résumé exports also require authentication.
- **Publish:** a confirmation, a save of the exact working copy, then a revision-checked public write. A failure is reported; it is never shown as a success.
- **Public refresh:** new requests read the current publication. Already-open pages refresh on focus, same-browser notification, or a 60-second timer.

Draft and published records carry separate revisions. The filesystem adapter uses an atomic lock, ETag comparison, and rename; Blob uses uncached private reads and ETag-conditional writes. A stale writer gets **409**, not silent last-writer-wins behavior.

If another tab changed the draft, back up your edits, reload latest, and reconcile. An old saved draft is not automatically loaded over a newer publication. Restoring it requires review and explicit rebasing before publishing.

**Visibility is not confidentiality.** Hidden items are omitted from rendering but can remain in public published JSON. Draft records are the private boundary. Never publish secrets, private customer data, or credentials—even in hidden records.

## Authentication and security model

- Single-owner password stored as a salted **scrypt** hash, not plaintext or a client-side digest.
- Eight-hour HMAC-signed session cookie: **HttpOnly**, **SameSite=Strict**, **Secure on HTTPS/Vercel**. No auth token is written to localStorage.
- Same-origin/custom-header checks plus per-session **CSRF tokens** for authenticated mutations; no permissive CORS policy.
- Persistent per-client and global login/setup/password attempt limits, shared across serverless instances through the content store.
- Logout and password changes rotate the server signing secret, revoking existing sessions rather than merely removing a browser cookie.
- Bounded JSON requests (256 KB), schema validation, safe URLs, and escaped metadata/print/bootstrap output. No untrusted HTML editor or `dangerouslySetInnerHTML`.
- Auth and rate-limit records are never returned by content APIs or JSON export. Server errors do not print password bodies, cookie values, Blob tokens, or auth records.
- Local data/key files are not served by Express or Vite. Dev filesystem access explicitly denies private data and credential files.

Use HTTPS in production. Open admin in a new tab when previewing inside an iframe: browser third-party-cookie restrictions may otherwise reject the secure session. Do not weaken cookie protections to work around that.

## Backups, reset, and password recovery

- **Export content JSON** backs up the working content only. **Import** validates and replaces the working copy; save/publish remain separate actions.
- **Start from published** replaces the working copy, not the live publication. Save a new draft to replace an existing saved draft.
- **Restore factory content** loads the original eleven-project data into the working copy and requires explicit confirmation. It does not erase authentication.
- Changing the factory TypeScript data and redeploying does **not** overwrite existing stored content.
- There is no public password-reset endpoint or default recovery password. If the password is lost, the server/store owner must back up content, remove only the private auth record through trusted hosting/storage access, configure a fresh private bootstrap key, and repeat setup. Preserve draft/published records. Never provide a reset path that anyone visiting the site can use.

For a persistent non-Vercel Node host, back up the complete private data directory through trusted server access and set `PORTFOLIO_DATA_DIR` to a private persistent disk location. On Vercel, use trusted private-store operations for operational backups; never make the auth/draft blobs public to download them.

## Résumé, media, and contact limits

Live résumé downloads use published content; preview downloads use the authenticated draft. HTML is the browser print/Save PDF version, not a pre-generated PDF. The résumé toggle blocks live export endpoints and hides UI controls. Factory exports remain version-controlled build references under `public/resume/`; canonical legacy links redirect to the live API.

Every project has a labeled local SVG illustration by default, including category-based images for new projects. Under **Projects → Project image**, enable a custom image and enter an HTTPS URL or deployed `/projects/` path plus a description. These covers are not verification evidence and do not need a made-up capture date. An actual working-UI screenshot belongs in the separate **Genuine project capture** fields and takes priority over the illustration. This implementation does not upload images or provision public media storage. Never add developer portraits or fabricated proof-of-product screens.

The contact form still opens an encoded `mailto:` draft. It does **not** send email or save visitor submissions. The admin is a content backend, not a contact-delivery service.
