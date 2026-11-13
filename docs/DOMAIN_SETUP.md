# Connect `vikas.is-a.dev` to the portfolio

**Status: prepared, not connected.** The owner selected `vikas.is-a.dev` and confirmed control of the existing registration under `vikki-k-s`. These files do not submit a registry pull request, change live DNS, attach a Vercel domain, verify ownership, or deploy the website.

## Prepared files

| File                                               | Purpose                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/is-a-dev/domains/vikas.json`                 | Proposed registry update using the owner's supplied A value (`216.198.79.1`); preserves the registered owner, all three Zoho MX records, and all existing TXT records. Confirm routing in the correct project's Domains page before submission. |
| `docs/is-a-dev/domains/_vercel.vikas.json.example` | **Unfinished template**, not a submission-ready record. Fill it with Vercel's actual domain-verification TXT value and remove `.example` before submitting.                                                                                     |
| `src/data/portfolio.ts`                            | Factory portfolio URL set to `https://vikas.is-a.dev`.                                                                                                                                                                                          |
| `index.html`                                       | Matching fallback canonical and Open Graph URLs.                                                                                                                                                                                                |
| `public/resume/Vikas_Bhardwaj_Resume.{html,txt}`   | Regenerated factory résumé exports with the intended custom URL.                                                                                                                                                                                |

**Do not cut over DNS or deploy this branch's new canonical URL until the correct portfolio deployment is ready.** The old Vercel address remains available in Git history; no host-wide redirect is introduced by these changes.

## 1. Identify and prepare the correct Vercel project

The connected project is now identified as **[vikas](https://vercel.com/vbvoxe-9513s-projects/vikas)**, linked to **`vikas-bhar/portfilio`** with `main` as its production branch. Its existing production alias is **`https://vikas-dun.vercel.app`**. Earlier searches did not find it; a later read confirmed this project and its repository link. Do not use one of the showcased project demos instead.

**Important spelling mismatch:** the project currently lists `vikas-is-a.dev` and `www.vikas-is-a.dev` (a **hyphen** after `vikas`). These are different domains from the owner-approved **`vikas.is-a.dev`** (a **dot** after `vikas`). The requested dot-separated domain is not yet in the project's domain list, so no verification TXT value for it has been obtained. Do not reuse the hyphenated domain's verification status, change the intended canonical address to it, or remove existing domains without approval. No Vercel domain settings were changed during this preparation.

- Deploy the **complete repository**, with `vercel.json` and `api/`, using Node 22 LTS or a compatible newer LTS version. Do not deploy only `dist/` or switch this app to static GitHub Pages: the admin requires its server/API.
- Confirm the Vercel production deployment serves the intended portfolio, `/api/site`, `/api/resume/html`, `/api/resume/text`, and `/admin` before changing DNS.
- For shared admin publishing, complete the **private Blob store** and owner setup in [ADMIN.md](ADMIN.md). Domain setup does not provision storage or create an admin account.

## 2. Add the exact domain in Vercel

In the **correct project's Settings → Domains**, add:

```text
vikas.is-a.dev
```

Attach it to the production site. Disable any suggested redirect to `www.vikas.is-a.dev`; that would require an additional nested registration. Use the manual DNS instructions and copy the exact routing and ownership-verification records that Vercel shows. The official is-a.dev guide describes this flow. [1](https://docs.is-a.dev/guides/vercel/)

The prepared records now reflect the owner's latest supplied A value:

| Type                       | Full hostname            | Prepared value                                                                  |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| A                          | `vikas.is-a.dev`         | `216.198.79.1` — owner-supplied; confirm in the exact domain's project settings |
| TXT, if Vercel requests it | `_vercel.vikas.is-a.dev` | **Pending: copy the exact value from the correct Vercel project**               |

The prepared A value comes from the owner's supplied snippet, **not** a completed project-specific verification. The separate DNS-configuration API still returned `76.76.21.21` while the requested domain was unattached. **Do not combine both addresses or assume either response verifies the domain.** Add the exact dot-separated domain to the correct project, then use the routing value its Domains page assigns before submitting the registry update. If that value differs, update `records.A` in `vikas.json` accordingly. The verification hostname must also match the actual Vercel instructions; if Vercel requests a different TXT hostname, use its corresponding registry filename instead of guessing.

The example file deliberately contains `REPLACE_WITH_THE_EXACT_VERIFICATION_TXT_VALUE_FROM_VERCEL`. **Never submit that placeholder.** A DNS verification TXT value is public record content; it is not a Vercel API token, admin password, or environment secret.

## 3. Update the existing is-a.dev registration

DNS for is-a.dev is managed through JSON files in **`is-a-dev/register`**, not by adding a GitHub Pages `CNAME` file to this portfolio. [5](https://docs.is-a.dev/quickstart/)

1. Use the GitHub account that controls the registration (`vikki-k-s`, confirmed by the owner), or follow the registry maintainers' ownership-transfer process if changing accounts. Do not silently replace `owner.username` with the portfolio's separate social username, `vikas-bhar`.
2. Fork/open [is-a-dev/register](https://github.com/is-a-dev/register), then re-read its current `domains/vikas.json` before editing. Preserve any records that have changed since this package was prepared.
3. If Vercel requests ownership verification, fill the TXT template and add it to the fork as **`domains/_vercel.vikas.json`**. Its hostname is separate from `vikas.is-a.dev`, so existing Zoho/SPF TXT records stay untouched.
4. For the safest migration of this existing site, submit and complete TXT verification first where Vercel permits it. Once the destination deployment is ready, update **`domains/vikas.json`** from the prepared file, changing only the website's A records.
5. Open the corresponding pull request(s) against **`is-a-dev/register`** and wait for maintainer approval and DNS propagation. A pull request against this portfolio alone cannot update their DNS.

Registry filenames omit `.is-a.dev`: `vikas.json` represents `vikas.is-a.dev`, and `_vercel.vikas.json` represents `_vercel.vikas.is-a.dev`. [2](https://docs.is-a.dev/domain-structure/)

**Preserve mail:** the existing registration contains three Zoho MX records, a Zoho ownership TXT record, an SPF TXT record, and another verification TXT record. The prepared file preserves them all. Keep A routing here rather than replacing the root record set with a CNAME: an ordinary CNAME cannot coexist with the existing MX/TXT records. [3](https://docs.is-a.dev/faq/)

Do not change the parent `is-a.dev` nameservers, add an unrequested `www` redirect, or remove existing email/DKIM/verification records. The retained TXT values are already public DNS records, not application credentials.

## 4. Finish the application cutover

After Vercel reports valid DNS/ownership and HTTPS works:

1. Merge/deploy this branch's canonical URL and regenerated résumé changes to the correct portfolio project. Keep the existing Vercel URL available during migration.
2. If the site has **already published CMS content**, sign in using **☰ → Admin login**, edit **Profile & home → Portfolio URL / canonical address** to `https://vikas.is-a.dev`, then **Save draft → Preview → Publish**. A redeploy intentionally does not overwrite existing publications; do not reset unrelated content to change one URL.
3. Verify the actual HTML response's canonical and `og:url`, the public `/api/site` profile URL, and both live résumé exports. They should all use the custom domain after publication.
4. Sign in again on the custom domain. Admin cookies and browser preferences are host-scoped; do not widen the cookie domain or weaken same-origin/CSRF protections to share a session with the Vercel hostname.
5. Test the contact email handoff, external project links, menu-only admin access, and Zoho mail. GitHub social links must remain `https://github.com/vikas-bhar`.
6. Only after the new host works reliably, optionally configure the old portfolio hostname to redirect to it in Vercel. No redirect is enabled in this preparation branch.

## Verify and recover

From a machine with DNS utilities:

```bash
dig +short A vikas.is-a.dev
dig +short TXT _vercel.vikas.is-a.dev
dig +short MX vikas.is-a.dev
dig +short TXT vikas.is-a.dev
curl -I https://vikas.is-a.dev/
curl -fsS https://vikas.is-a.dev/api/site
curl -fsS https://vikas.is-a.dev/api/resume/text
```

Expected after cutover: A matches the correct Vercel project's current recommendation, verification TXT matches the value it issued, HTTPS serves this portfolio, all existing Zoho MX/TXT records remain, and the published profile/résumés use the custom URL. These are **acceptance checks, not a claim they have passed on the live custom domain**.

If routing fails, restore the previous website A records through the is-a.dev registry while preserving mail:

```json
["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]
```

Those were the GitHub Pages addresses in the existing registration when inspected. Registry rollback also needs approval/propagation; keep the known working deployment URL accessible meanwhile. If necessary, roll back the application canonical URL separately and update the published CMS URL as well.
