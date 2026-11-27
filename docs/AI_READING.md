# AI-readable portfolio

The portfolio exposes public, UTF-8 Markdown/text resources so AI assistants, retrieval tools, and people can read its information without executing React or using an admin session. The index follows the [llms.txt proposal](https://llmstxt.org/).

| URL              | Content type    | Purpose                                                                                                                                                            |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/llms.txt`      | `text/plain`    | Small index with the owner's identity, summary, interpretation/evidence context, and links to the complete text, enabled résumé exports, and public profiles.      |
| `/llms-full.txt` | `text/plain`    | Complete readable portfolio: profile, build approach, visible projects and their full details, skills, About/focus areas, experience, contact, and evidence notes. |
| `/index.md`      | `text/markdown` | The same complete content as `/llms-full.txt`, exposed as the Markdown alternate of the home page.                                                                 |

These are **runtime resources**, not checked-in snapshots in `public/`. `src/lib/llms.ts` projects the current published content into Markdown. `server/llms.ts` serves it through the same Node/API runtime as the site. `server/app.ts` handles conventional root URLs in development/production preview; `vercel.json` rewrites them to `/api/llms`, `/api/llms/full`, and `/api/llms/markdown` in a repository deployment.

## Keeping content current

The resources call the existing `readPublished` function on each request. **Save draft → Preview** does not alter them; **Publish** updates them for all readers, without regenerating a file or resetting content. `Cache-Control: no-store` avoids serving a previous publication. If a configured shared store is unavailable, they return plain-text **503**, not a stale factory portfolio. As elsewhere, an installation that has never configured publishing can serve factory content.

The full text follows visible section order and excludes hidden project/section details from its own output. As documented elsewhere, visibility is a presentation control, not a secrecy mechanism: existing public JSON and enabled résumé exports have their own established scope. Keep confidential information in private drafts rather than publishing it and hiding it.

The text keeps private/unverified-source labels and access-request contact information, but does not serialize private repository URL fields. Unavailable demo URLs are not promoted as usable links. Descriptions, architecture, impacts, verification dates/notes, and prototype caveats remain owner-published information; a checked public page is not described as an end-to-end test. Illustrations and supplied captures stay explicitly distinguished.

## Discovery and compatibility

- The actual public HTML contains `rel="describedby"` for `/llms.txt` and `rel="alternate" type="text/markdown"` for `/index.md`; the HTTP `Link` header provides equivalent discovery.
- A public **AI text** footer link opens `/llms.txt`. Admin links still appear only in the three-line menu.
- Public text documents also emit discovery headers and support **GET / HEAD**, inline UTF-8 responses, and anonymous cross-origin reads (`Access-Control-Allow-Origin: *`, without credentials). Other methods return **405**.
- Same-site resource links are root-relative, so they work on the current deployment/preview host even while the separately configured canonical domain is pending. External profile/demo/public-source links retain the published values. HTTP `Host` / forwarded-host headers are never used to generate document links.
- Private pages and draft-preview HTML do not advertise these as their own alternates. The text URLs always serve **published** content, regardless of cookies or `?preview=draft`; they are not draft exports.

No AI account, model API key, MCP server, training permission, or write/action access is added. Authentication, CSRF, private storage, and editor publishing remain unchanged. No crawler-specific blocks or permissions are changed. Publishing an `llms.txt` file makes content easier for compatible tools to retrieve; **it cannot guarantee every AI service will discover, crawl, index, or use it**.

## Checks

```sh
npm run check
npm run build
npm run test:e2e

# Against a running full Node preview (not a static dist-only server):
curl -i http://localhost:3000/llms.txt
curl -I http://localhost:3000/llms-full.txt
curl http://localhost:3000/index.md
```

Tests cover the index format, full content and evidence fidelity, hidden content, editable identity, Markdown escaping, URL handling, Vercel rewrites, GET/HEAD/method/CORS behavior, storage failures, draft isolation, publishing updates, discovery, and reading without JavaScript. These changes do not deploy to production, activate a custom domain, or provision private Blob storage.
