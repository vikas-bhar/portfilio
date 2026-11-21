# File organization

The uploaded portfolio is organized into a runnable React/Vite/TypeScript project, with the original moving elements retained and developer portraits removed. The latest changes restore older projects, add compact expandable cards, and introduce a protected whole-site editor.

## Main entry points

| Location                                      | Purpose                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/main.tsx`, `src/Root.tsx`                | Browser bootstrap; lazy `/admin` route or public site/provider                                               |
| `src/App.tsx`                                 | Published section order/visibility, theme, résumé state, preserved global motion                             |
| `src/components/SiteProvider.tsx`             | Validated public content or authenticated draft preview, live refresh, metadata/accent settings              |
| `src/context/`, `src/hooks/useSiteContent.ts` | Shared editable content state; factory fallback for isolated component rendering                             |
| `src/data/portfolio.ts`                       | Validated **factory** profile, eleven projects, capabilities, milestones, ordered sections, copy, appearance |
| `src/lib/site-schema.ts`                      | Shared Zod validation and content/record/session types                                                       |
| `server/start.ts`, `server/app.ts`            | Full same-origin development or production-preview server; Express plus Vite middleware in development       |
| `server/api.ts`, `server/content.ts`          | Public content, protected drafts/publishing, live résumé, revision checks                                    |
| `server/auth.ts`                              | Password hashing, signed cookies, CSRF support, persistent attempt limits                                    |
| `server/store.ts`                             | Atomic private filesystem storage or private, conditional-write Vercel Blob adapter                          |
| `server/page.ts`                              | Escaped published metadata and bootstrap content in the actual HTML response                                 |
| `api/[...path].ts`, `api/page.ts`             | Vercel Node function entry points; no development server dependency in the deployed API                      |
| `src/lib/admin-api.ts`                        | Same-origin API client; no embedded password or server secret                                                |
| `src/admin/`                                  | Auth/setup screen, editor workflow, project/content/appearance/security forms, private-workspace styles      |

## Public presentation

The original section components remain under `src/components/`: Hero, Navbar, Projects, Skills, About, Experience, Contact, Footer, and ResumeModal. They now consume shared site content rather than static exports.

- `Projects.tsx` manages Featured / All / domain filters and preserved animated grid transitions.
- `ProjectCard.tsx` renders a brief card and an independent accessible **Show more / Show less** expansion.
- `ProjectCover.tsx`, `src/lib/project-images.ts`, and `public/projects/*.svg` supply eleven local illustrations, safe owner-configured images, category defaults for new projects, and a missing-image fallback.
- `ProjectPreview.tsx` still supports genuine UI captures or an explicitly labeled diagram fallback; illustration covers are not passed off as screenshots.
- `ProjectActions.tsx` distinguishes verified/provided/unavailable demos and public/private/unverified source. Profile links are not disguised as project source.
- `src/lib/resume.ts` and `resume-html.ts` share runtime text/print output with the API and factory generator.
- `scripts/generate-resume.ts` generates factory reference HTML/TXT under `public/resume/`; runtime links use the CMS API.
- `src/lib/contact.ts` and `projects.ts` create correctly encoded, project/profile-aware email links.

The source still includes the original `Ambient3DBackground`, `CyberMatrixWires`, `Floating3DWrapper`, `TiltCard`, and `WireframeGlobe`, with reduced-motion, touch, WebGL, cleanup, and lifecycle safeguards. The admin animation toggle adds a static option without changing the enabled original scene. Circuit measurements follow filtering, expansion, and section order/visibility changes.

Styles live in `src/styles/`; `editor-integration.css` adds compact-card, draft-preview, and CMS-setting behavior. `simple.css` adds the quieter typography, optional hero detail, compact illustrated grid, and menu-only Admin login access on desktop and mobile without removing the motion system. Admin styles are separately lazy-loaded from `src/admin/admin.css`. Fonts remain self-hosted.

## Content decisions

Four flagships stay first: **Kisan Sathi, AEO Pulse, FocusPulse, Rasa by Gulab — Direct-Ordering Prototype**. Seven earlier projects are restored alongside them: Venus AI, Sheet Craft, PrepStudy Platform, Arora Tech, MS Fast Food Point, LSSS School, and Rahat Hospital & Research Centre. Rasa is not duplicated.

The verified Kisan stack remains Expo/React Native, and the supplied AEO deployment remains Express/Supabase. FocusPulse is builder-provided native architecture; Rasa is a concept, not an official launch. Failed or mismatched legacy demos stay unavailable. Real screenshot support is not permission to restore developer portraits or invent UI evidence.

The original Hero/About portrait JPGs and generated WebPs, the portrait optimizer, and Sharp remain deleted. `docs/reference/nexus-lab.png` is only the supplied design reference, not a project screenshot.

## Configuration, private data, and checks

- `package.json`/lockfile: reproducible runtime, build, lint/type/format/component/server/browser checks.
- `vite.config.ts`: client build, lazy WebGL/validation splitting, allowed preview hosts.
- `vercel.json`: complete repo deployment, API functions, runtime page metadata, résumé redirects, caching/security headers.
- `docs/DOMAIN_SETUP.md`, `docs/is-a-dev/domains/`: the selected `vikas-portfolio.is-a.dev` free-subdomain registration package, with A routing and the real Vercel-issued TXT value. The hostname is attached to the existing Vercel project, but the separate is-a.dev registry still needs submission/approval before DNS can go live.
- `docs/archive/is-a-dev/`: superseded proposed files for `vikas.is-a.dev`, preserved unchanged with their old owner/mail data. Do not submit them for the new name.
- `.env.example`: server-only configuration names with no actual credentials.
- `.portfolio-data/`: ignored owner records and setup key. Never serve, commit, or copy into static output.
- `.portfolio-test-data/`: ignored, isolated browser-fixture records. Never used by the owner's preview.
- `src/**/*.test.*`: component behavior, factory content, schema, résumé, email and API-client tests.
- `server/**/*.test.ts`: real HTTP/auth/private-draft/publish/durability/concurrency/security checks.
- `tests/`: desktop/mobile workflows, anonymous preview rejection, whole-site publishing, conflict recovery, axe, original motion/WebGL, responsiveness, and résumé/contact behavior.
- `.github/workflows/ci.yml`: formatting, lint/types/tests, build, Chromium installation, browser suite.

See [Admin setup](ADMIN.md) for local/Vercel storage and owner setup; [Project verification](PROJECT_VERIFICATION.md) for external evidence and remaining GitHub work. No production deployment or private-source visibility change was made by these file changes.
