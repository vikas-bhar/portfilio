# Project verification & publishing handoff

Checked **2026-11-11**. No external project was changed, no order/test telemetry was submitted, no source repository was made public, and no production deployment was triggered.

## Decisions approved by the user

- Complete the showcase now with **honest unavailable states** for missing screenshots and source/demo links.
- Use the **verified deployed stacks**: Expo / React Native for Kisan’s web build; Express / Supabase for the supplied AEO gateway. Do not call those deployments Next.js applications.
- Retain the four priority flagships **alongside the older projects**, with concise cards and individual Show more / Show less controls. Rasa remains one flagship, not a duplicated legacy record.
- Add a **password-protected, server-backed whole-site editor** with private drafts, authenticated preview, and explicit shared publishing. Local browser-only publishing was rejected.
- Preserve the original moving elements and the developer-photo-free layout.

## Public pages retrieved

| Case study                                | Public destination                    | What was actually observed                                                                                                                                                                                                                             | Verification limits                                                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kisan Sathi                               | https://kisan-saathi-indol.vercel.app | A public onboarding page offering English, Hindi, Dogri, Urdu, and a demo entry. Vercel’s project settings use `npx expo export --platform web --output-dir dist`, with root `kisan-saathi`.                                                           | No independent offline, disease-inference, weather, or mandi-price test. The SEVA2026 purpose and product architecture are supplied by the builder.                                                                                         |
| AEO Pulse                                 | https://unknown-alpha-two.vercel.app  | Public Agentic Telemetry Gateway UI, crawler totals/feed, script/Cloudflare/Next.js-middleware integration instructions, WebMCP dispatcher, AEO auditor, and security scanner controls. Vercel identifies an Express project / `server.js` deployment. | No authentication, ingestion/write API, tool dispatch, audit, security scan, or real-time update was exercised. No analytics-growth claim is made. A Next.js middleware integration example does not make the gateway itself a Next.js app. |
| FocusPulse                                | No verified public demo supplied      | The builder’s described architecture: C++ host daemon, Chrome MV3 / `declarativeNetRequest`, esbuild, Android Accessibility Services.                                                                                                                  | No matching repository, UI capture, executable, or live demo was verified. The public `vikas-bhar/ads-blockker` repository describes a different ShieldAd product; it is deliberately not misattributed to FocusPulse.                      |
| Rasa by Gulab — Direct-Ordering Prototype | https://rasa-by-gulab.vercel.app      | Public Next.js concept page with explicitly labeled sample business content, a menu, Add to Bag controls, and a WhatsApp ordering handoff.                                                                                                             | Not the official restaurant site. No order was placed, owner endorsement confirmed, or realized commission/revenue impact measured.                                                                                                         |

“Public page checked” means that the page content was successfully retrieved. It is not a claim of browser end-to-end or backend feature verification. The portfolio’s local automated tests never open these external destinations.

The existing production portfolio at https://portfolio-vikas-eosin.vercel.app was also retrieved and still showed the earlier AI/3D positioning during inspection. This branch has not been deployed there.

## Restored earlier projects

The older collection is preserved, not silently removed because a deployment failed. The records use these honest states:

| Project                          | Destination/status                                                 | What was actually checked / limits                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Venus AI                         | Former `https://vdda.netlify.app/` is **not a current Venus demo** | It serves **Veda Scholar**, a JK/academic preparation portal. Keep Venus, but do not mislabel another product as its demo. Updated URL needed.                                                                               |
| Sheet Craft                      | https://sheet-craft-two.vercel.app                                 | Text/files/images-to-Sheets landing page, sign-in and guest/offline-demo entry. No Google authentication or spreadsheet writes tested.                                                                                       |
| PrepStudy Platform               | https://prepsudy.vercel.app                                        | Academic subject/question/answer/image-upload/evaluation controls. No file uploaded or evaluation submitted.                                                                                                                 |
| Arora Tech                       | https://arora-tech.vercel.app                                      | Refurbished laptop storefront/catalog. No transaction, inventory accuracy, testimonials, customer counts, or commercial results verified.                                                                                    |
| MS Fast Food Point               | https://ms-fast-food-point.vercel.app                              | Menu categories and order-building controls. No order placed; delivery-time/nutrition claims not verified.                                                                                                                   |
| LSSS School                      | https://lsss-school-sage.vercel.app                                | The supplied Vercel alternative loaded a school/admissions/programs/portal page. Original custom domain `littlestarseniorsecondaryschooljuria.com` could not be retrieved. No portal login or institutional claims verified. |
| Rahat Hospital & Research Centre | Previous deployment **unavailable**                                | `https://rahat-hospital-reserch-centre.vercel.app/` returned Vercel 404 / `DEPLOYMENT_NOT_FOUND`; no medical-service availability implied.                                                                                   |

The alternate `https://rasa-by-gulab-k8ew.vercel.app/` also returned `DEPLOYMENT_NOT_FOUND`; it is not used as a verified working replacement.

The factory collection has **11 unique projects**, **4 featured**, all visible by default. Eight demo pages have a checked-availability state; FocusPulse, Venus, and Rahat have explained unavailable states. Legacy technologies are retained from supplied project descriptions, not independently certified by retrieving a landing page.

## Source repository status

The following private source mappings were returned by the connected Vercel project/deployment metadata:

| Case study  | Identified GitHub repository                          | Website behavior                                                                     |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Kisan Sathi | `vikas-bhar/leadscout..`, project root `kisan-saathi` | GitHub private state and a source/walkthrough email request; no public-source claim. |
| AEO Pulse   | `vikas-bhar/unknown`                                  | GitHub private state and a source/walkthrough email request.                         |
| FocusPulse  | Not supplied / verified                               | GitHub unverified state and walkthrough request; no guessed repository URL.          |
| Rasa        | `vikas-bhar/RASA-by-Gulab`                            | GitHub private state and source/walkthrough request.                                 |

The GitHub connection authenticates as `vikas-bhar` but does not have access to those private repositories. A direct read of the identified Rasa repository returned **403: Resource not accessible by integration**. The public repository list is not proof of access to the private source. Reconnect GitHub in Arena with the required repositories included before requesting source inspection or changes; do not share credentials in chat.

The owner has now supplied **`https://github.com/vikas-bhar`** as the portfolio’s canonical GitHub profile. The Hero, project collection, contact section, footer, and résumé use that account. This profile-link update does not change repository visibility or the verification limits above.

## Screenshots

No actual working-UI captures were available in the workspace or supplied for these four products. Direct outbound browser access to their hosts is restricted in this sandbox. No generated/mock UI image or stock photograph is presented as a screenshot.

Cards are brief by default. **Show more** reveals the flagship architecture map with **“Working-UI capture pending”** and **“Architecture diagram—not a screenshot.”** Earlier projects without architecture details show an honest missing-capture note instead. This is an approved interim state, not a completed screenshot requirement.

The later simplicity update adds eleven hand-authored SVG project illustrations to the collapsed cards. They are labeled **Illustration**, are purely thematic, and do not change any verification dates, demo/source states, or product claims. Owner-supplied project images can be configured separately in the admin.

To add genuine captures:

1. Capture the actual app in a browser (or record a short, accessible demo); do not include secrets, personal data, or private telemetry/IPs.
2. Put optimized screenshots in `public/projects/` using meaningful filenames. Keep large video sources and temporary recordings out of Git.
3. Configure the matching project’s genuine-capture fields in `/admin`, or set `screenshot: { src, alt, width, height, capturedOn }` in the factory data for a fresh installation. Use the true capture date and native dimensions.
4. Rebuild and test. `ProjectPreview` preserves aspect ratio, renders descriptive alternative text, and falls back to the labeled diagram if the image fails.
5. Keep Hero/About portrait-free; the project-image capability is not permission to reintroduce developer photos.

## Remaining GitHub polish checklist

**Not completed:** source README updates and pinning four public project repositories. This session is scoped to the current portfolio branch, and the corresponding private repositories are not readable through the GitHub connection. No remote changes or new branches were attempted.

Before public launch, the owner should:

- [x] Set the portfolio profile to the owner-supplied `vikas-bhar` account. Repository pinning itself remains pending.
- [ ] Supply the matching FocusPulse source/demo or a native-installation walkthrough.
- [ ] Decide whether to publish repositories, share a read-only subset, or keep source available on request. Never change visibility without explicit approval and a secret/license review.
- [ ] Add/update each actual repository’s README using the outline below, checking commands against the source rather than copying guessed setup steps.
- [ ] Pin the four public project repositories from GitHub’s profile customization UI, or use public project-overview repositories if implementation source must remain private.
- [ ] Add real working-UI captures and verify the advertised product workflows.
- [ ] Update the portfolio’s availability unions only after the destinations are genuinely public and reachable.

### README outline for each actual project repository

1. **Problem & users:** the constraint or commercial bottleneck; scope of this build.
2. **Demo / install:** working URL or native installation procedure, screenshot of the actual UI, clear prototype/private limitations.
3. **Local setup:** actual runtime versions; the repository’s lockfile/package-manager install command; an `.env.example` containing variable names but no secrets; actual dev/build/test commands; required native/Android toolchains where applicable.
4. **Architecture & decisions:** client/server/native boundaries, data flow, persistence/cache behavior, inference/filtering integrations, deployment target, and trade-offs.
5. **Testing & limitations:** what is automated, what was checked manually, known gaps; do not claim validation or commercial metrics that have not been measured.
6. **Security & license:** permission model, secret handling, third-party data/model/filter-list terms, and licensing.

The portfolio README already documents this repository’s actual local setup and architecture. It is not a substitute for the four product source READMEs.

## Portfolio admin deployment status

The whole-site editor, private draft/publish API, same-origin Node host, and Vercel function/storage adapter are implemented. Automated tests exercise the local server and mock the private Blob SDK contract; they do not establish that a real Vercel Blob store has been provisioned or that this branch is deployed.

The owner's Arena preview uses private server files, shared with visitors to that preview. Durable Vercel publishing requires a **private Blob store**, server-only token, and one-time owner setup. These resources/secrets were not created through the connected app. See [Admin setup](ADMIN.md); do not claim the existing production portfolio has changed until it is deployed and verified.
