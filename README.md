# Vikas Bhardwaj — Product Engineering Portfolio

A responsive **Full-Stack & Applied AI Product Engineer** portfolio built with React, TypeScript, Vite, Motion, and Three.js, plus a password-protected, server-backed content editor.

- **11 projects:** four priority flagships plus seven restored earlier projects. All are visible by default; the Featured filter selects the four flagships.
- **Simple, illustrated cards:** each project has a lightweight local image, a brief description, and an individual, accessible **Show more / Show less** for the full story and evidence notes. The images are labeled illustrations, not working-product screenshots.
- **Quieter layout:** a single-column introduction, optional How I approach a project details, consistent typography, and a compact responsive project grid. Original motion is retained with a subtler visual treatment.
- **Whole-site administration:** projects, ordering/visibility, profile/contact links, hero, capabilities, About, experience, section order/copy, theme accents, motion, metadata, and résumé settings.
- **Save draft → Preview → Publish:** private server-side drafts, authenticated previews, shared published content, and optimistic concurrency protection.
- **Original moving elements preserved. Developer portraits remain deleted.**

## Run locally

Use Node.js **22.13+** (Node 22 LTS recommended) and npm:

```bash
npm ci
npm run dev
```

Open **http://localhost:3000**. The Express server and Vite middleware share one origin, bind to `0.0.0.0`, and support Arena preview hosts. There is no browser-facing localhost backend URL or second API port.

No environment variables are needed locally. Private records are stored in ignored **`.portfolio-data/`**, not in browser storage or the public directory. The terminal prints a **private, one-time `/admin#setup=…` link**. Open it in a new tab and choose your own password (14–128 characters). The key is removed from the address bar; setup cannot be reused after the account is created. There is no default password.

**Vercel requires durable private Blob storage.** Local filesystem storage is never selected on Vercel. If storage is missing, the public factory portfolio remains available, but admin publishing fails closed with setup instructions. See [Admin and deployment setup](docs/ADMIN.md).

## Commands

| Command                          | Purpose                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`                    | Run the content API and Vite development middleware on port 3000               |
| `npm run build`                  | Generate factory résumé exports, type-check client/server, build `dist/`       |
| `npm run preview`                | Run the production site **and API** on port 4173                               |
| `npm run preview -- --port 3000` | Run the complete production preview on port 3000                               |
| `npm run check`                  | Formatting, lint, types, component/content tests, HTTP/security tests          |
| `npm run test:e2e`               | Isolated desktop/mobile publishing, accessibility, behavior, and motion checks |
| `npm run test:server`            | Server authentication, private drafts, durability, and concurrency tests       |
| `npm run resume:generate`        | Regenerate the factory printable HTML and TXT exports                          |
| `npm run format`                 | Format maintained files with Prettier                                          |

Do **not** replace the server commands with `vite preview` or deploy only `dist/`: a static file server cannot authenticate admins or publish shared changes.

For browser tests:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

A custom Chromium executable can be supplied through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The sandbox also needs its browser-library directory in `LD_LIBRARY_PATH`. Tests start a separate server on **3100**, use ignored `.portfolio-test-data/`, and never create an account or publish to the owner's preview. A single browser worker prevents the shared fixture from changing during unrelated public-site assertions. Admin tests restore factory content after each test.

## Content and editorial workflow

Open **`/admin`**, or open the **three-line menu (☰)** in the header and choose **Admin login**. The admin link is deliberately absent from the closed page and footer on desktop and mobile. The link opens a top-level tab. For the first visit, use your private one-time setup link to create your password; afterward, return to `/admin` and sign in with it. Browser iframe/third-party-cookie restrictions can interfere with authentication inside an embedded preview; cookies stay same-origin and are not weakened for that case.

1. Edit the working copy. Unsaved edits stay in the current tab; navigation away warns before discarding them.
2. **Save draft** stores the working copy privately on the server. Visitors still see the published version.
3. **Preview** saves if needed and opens `/?preview=draft`, which requires an authenticated admin cookie. A visible banner marks it as unpublished; an anonymous visitor sees a sign-in gate instead.
4. **Publish** asks for confirmation, saves the exact working copy, and updates shared content. New visits use it immediately; existing tabs refresh on focus, same-browser notification, or within 60 seconds.

Two tabs cannot silently overwrite the same draft or publication: stale writes return **409 Conflict**. Reload the latest content or export your unsaved work before reconciling. Drafts based on an older publication require explicit review/rebasing. JSON export/import and factory/published-content recovery are available in Overview; backups contain **content only**, never authentication records.

Visibility controls are presentation settings, **not secrecy controls**. A hidden project's data can remain in published JSON. Keep confidential work in the private draft, not merely hidden in a publication.

### Factory content versus published content

`src/data/portfolio.ts` defines the validated, version-controlled **factory** portfolio. Once published, shared storage is the source of truth. Rebuilding/redeploying does not overwrite stored publications. Use the editor to change the live site or explicitly restore factory content into a draft.

`src/lib/site-schema.ts` validates both server writes and client reads: bounded content, unique IDs, safe HTTPS links, actual owner/repository GitHub URLs, real calendar dates, fixed section IDs, and accessible theme-accent contrast. React renders owner copy as text; printable HTML, server metadata, and bootstrap JSON are escaped.

## Projects and evidence

The flagships stay first and featured:

1. **Kisan Sathi:** Expo / React Native, offline-first agriculture, multilingual onboarding, DTU SEVA2026.
2. **AEO Pulse:** the supplied Express / Supabase telemetry and AI-search visibility gateway.
3. **FocusPulse:** builder-provided C++ / Chrome MV3 / Android Accessibility architecture; no verified public demo/source.
4. **Rasa by Gulab — Direct-Ordering Prototype:** Next.js hospitality concept, **not an official restaurant launch or a proven commercial outcome**.

Restored earlier work: **Venus AI, Sheet Craft, PrepStudy Platform, Arora Tech, MS Fast Food Point, LSSS School, Rahat Hospital & Research Centre**. Rasa is one project, not a duplicate older deployment.

Missing or mismatched deployments remain labeled unavailable. Source links are never guessed, private repositories are not presented as public, and a GitHub profile is never relabeled as project source. Each unavailable source has a project-specific email request.

All eleven projects now have **simple, self-hosted SVG illustrations** with descriptive alt text and lazy loading. Missing custom images fall back to a built-in illustration; new projects get a category illustration automatically. Use **Projects → Project image** in the admin to set an HTTPS image URL or an already-deployed `/projects/` image and its description. This is separate from product verification.

No actual working-UI screenshots were supplied. Expanded flagship cards still show explicitly labeled **architecture diagrams—not screenshots**. Genuine captures can be configured in the admin using an HTTPS image URL or an already-deployed `/projects/` file, descriptive alt text, dimensions, and capture date. This is not a file-upload service; developer portraits must not be restored.

See [Project verification](docs/PROJECT_VERIFICATION.md) for checked destinations, caveats, and the remaining external GitHub README/pinning work.

## Preserved behavior

- Exact initial product-engineer headline and hero summary; View Featured Projects / GitHub / Get in Touch; direct email/GitHub in the hero and footer.
- Four grouped capability pillars, concise practical About, and the supplied venture/hackathon/community milestones—no invented dates or awards.
- Original continuous float/sway, pointer parallax, hover depth, tilt/glare, and touch-device floating.
- Original ambient scene: **10 wireframe polyhedra, 65 constellation nodes, 120 dust particles**, dynamic connections, and pointer/scroll parallax. Lazy loading, cleanup, hidden-tab/dialog pauses, and WebGL/reduced-motion fallbacks remain.
- Four original Bézier circuits with streaming dashes, sparks, pinging terminals, and counter-rotating rings. Layout observation follows filtering, card expansion, and section reordering; a viewport-sized SVG avoids huge glow textures without changing the document-space paths.
- Dark/light preference persistence; a visitor's reduced-motion preference always wins over admin animation settings.
- Native résumé dialog, focus restoration/Escape, honest clipboard feedback, and live HTML/TXT/Print / Save PDF views. Published exports use `/api/resume/{html,text}`; authenticated draft exports keep the draft query. Legacy résumé URLs redirect to those endpoints.
- Contact validation and encoded email drafts. **The form opens the visitor's email app; this website does not deliver or store messages.**
- Self-hosted fonts. No portraits, Sharp dependency, optimizer, stock screenshots, or image-generation requests.

## Architecture and hosting

```text
src/                 React site, lazy admin, schemas, factory content, and shared résumé templates
server/              Same-origin HTTP API, scrypt/signed-cookie auth, private storage, metadata
api/                 Vercel Node function entry points (API catch-all and page/metadata renderer)
scripts/             Factory résumé generator
public/              Eleven project illustrations, favicon, web manifest, optional genuine captures, factory résumé exports
tests/               Isolated desktop/mobile browser suite
docs/                Admin setup, verification, and file organization
```

For Vercel, deploy the **repository**, not just static output. `vercel.json` configures Vite's build, Node API functions, the included `dist/index.html` page template, runtime page/metadata rewrites, résumé redirects, and security/cache headers. The private Blob token and one-time setup key are server-only environment variables. The connector available in this session does not expose Blob provisioning; no store, secrets, or production deployment was created automatically.

The selected free-subdomain URL for this branch is **`https://vikas-portfolio.is-a.dev/`**. The exact hostname has been added to the existing Vercel project, and [Custom domain setup](docs/DOMAIN_SETUP.md) includes two complete registry JSON files with Vercel's real TXT verification value. **is-a.dev registry submission/approval, DNS propagation, Vercel verification, and HTTPS checks are still pending.** Earlier `vikas.is-a.dev` files are archived, not reused for this different name. File changes and the Arena preview do not update registry DNS or overwrite published CMS content.

Dependencies are locked. `minimatch` is overridden to patched 11.x, and `zod: "$zod"` aligns the nested Blob tooling copy with the patched direct dependency. Review overrides during upgrades. Generated output, browser artifacts, private CMS records, environment files, and deployment credentials are ignored by Git.

See [File organization](docs/FILE_ORGANIZATION.md) and [Admin setup](docs/ADMIN.md) for implementation and operations details.
