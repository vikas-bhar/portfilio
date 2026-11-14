# Register and connect `vikas-portfolio.is-a.dev`

**Chosen address: `https://vikas-portfolio.is-a.dev` — with the full word “portfolio.”** The owner selected this free is-a.dev subdomain after confirming that the separate standalone domain `vikas-is-a.dev` had not been registered.

## Current status

- The new name had no registration file or matching open registration request in the is-a.dev registry when checked. This is **not** a reservation or a guarantee of approval; check again before submitting.
- **Completed:** added the exact hostname to the existing Vercel project **[vikas](https://vercel.com/vbvoxe-9513s-projects/vikas)**, linked to `vikas-bhar/portfilio`, for production with no redirect or branch-specific assignment.
- **Completed:** obtained a real verification TXT value for this exact name and read Vercel's routing recommendations. The active files contain no placeholder values.
- **Pending:** submit the registry files to `is-a-dev/register`, obtain maintainer approval, wait for DNS propagation, complete Vercel verification, and check HTTPS.
- Vercel currently reports **`verified: false`** and invalid DNS for this name. Adding a hostname in Vercel alone does not register it or configure the is-a.dev registry.

No registry pull request, registrar purchase, nameserver change, or live DNS update has been made. Existing Vercel domains and redirects were left unchanged. Source changes on this branch do not overwrite stored CMS publications or deploy production by themselves; the linked Git integration may deploy commits when pushed/merged.

## Ready-to-submit registry files

Copy these **two files** into the `domains/` directory of your fork of **[is-a-dev/register](https://github.com/is-a-dev/register)**, keeping their filenames exactly as shown:

| Local file                                           | Path in the registry fork              | DNS purpose                                            |
| ---------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| `docs/is-a-dev/domains/vikas-portfolio.json`         | `domains/vikas-portfolio.json`         | A record for `vikas-portfolio.is-a.dev`                |
| `docs/is-a-dev/domains/_vercel.vikas-portfolio.json` | `domains/_vercel.vikas-portfolio.json` | TXT verification at `_vercel.vikas-portfolio.is-a.dev` |

Both identify the owner as **`vikas-bhar`**, your portfolio's GitHub account. These are new-subdomain registration files, not an ownership transfer of the earlier `vikas.is-a.dev` entry.

### Exact DNS records

| Type | Full hostname                      | Value                                                            |
| ---- | ---------------------------------- | ---------------------------------------------------------------- |
| A    | `vikas-portfolio.is-a.dev`         | `216.198.79.1`                                                   |
| TXT  | `_vercel.vikas-portfolio.is-a.dev` | `vc-domain-verify=vikas-portfolio.is-a.dev,ad8f84217bc43c92f33f` |

The TXT value came directly from Vercel when this hostname was added. It is **public DNS verification content**, not an API token, admin password, or environment secret. Do not substitute a TXT issued for another domain.

Vercel's first-ranked IPv4 recommendation for this name includes `216.198.79.1`; that is the routing value used here. Recheck the exact domain in the project's Domains settings before submitting if the configuration changes. Do not combine unrelated targets or copy the previous standalone domain's `www` CNAME record into this registration.

## Submit the free registration

1. Sign in to GitHub as **`vikas-bhar`** and fork/open [is-a-dev/register](https://github.com/is-a-dev/register).
2. Check that neither of the two filenames above has been claimed or changed since preparation. Follow the registry's current contribution rules and pull-request template.
3. Add both prepared JSON files under **`domains/`** in the registry fork. They are already valid JSON with the actual username, A value, and Vercel TXT value.
4. Open a pull request against **`is-a-dev/register`** for **`vikas-portfolio.is-a.dev`**. Identify it as your developer portfolio, hosted on Vercel. Maintainers decide whether to approve the registration.
5. Wait for approval and DNS propagation. Return to the **vikas → Settings → Domains → vikas-portfolio.is-a.dev** entry and refresh/complete verification.

**A pull request against `vikas-bhar/portfilio` does not update is-a.dev's DNS.** The registry files must be accepted in their separate repository. You do not need to buy a standalone `.dev` domain or move the parent `is-a.dev` nameservers for this free-subdomain route.

Do not add a `www` redirect or nested hostname unless you deliberately register and configure that additional subdomain too. The new Vercel entry was added with no redirect, matching the non-`www` canonical URL.

Official references: [Vercel setup](https://docs.is-a.dev/guides/vercel/), [registry filename/record structure](https://docs.is-a.dev/domain-structure/), and [registration quickstart](https://docs.is-a.dev/quickstart/).

## Keep the similar names separate

- **`vikas-portfolio.is-a.dev`** — the only currently selected address. Use its two active files above.
- `vikas-porfolio.is-a.dev` — misspelled name already present in Vercel, with a different verification TXT. It was not removed, reused, or treated as approved registration.
- `vikas-is-a.dev` and `www.vikas-is-a.dev` — a different standalone `.dev` domain. The owner confirmed it was not registered; no purchase or DNS work for it was performed.
- `vikas.is-a.dev` — the earlier registered subdomain. Its old proposed files were moved unchanged to **`docs/archive/is-a-dev/`**. Its registered owner and Zoho/mail/TXT data are historical reference only; do not copy them into the new registration.

The last project-domain read also showed `vikas-dun.vercel.app` redirecting to the misspelled `vikas-porfolio.is-a.dev`. That redirect was not changed. Do not assume it is a working fallback; review it separately, and do not redirect a working deployment to the new hostname before its DNS/HTTPS works.

## Application and admin cutover

This branch prepares the factory portfolio URL, fallback canonical/Open Graph metadata, and generated HTML/TXT résumés for **`https://vikas-portfolio.is-a.dev`**. It does not force-overwrite published content.

1. Keep the complete repository deployment, `vercel.json`, and Node API functions. Do not switch to static GitHub Pages hosting: the admin needs its server/API.
2. After registration, DNS, Vercel verification, and HTTPS are ready, deploy/merge the new source URL. Do not promote an unregistered or unverified name as the live portfolio address.
3. If content was already published through the CMS, use **☰ → Admin login**, change the profile's **Portfolio URL / canonical address** to `https://vikas-portfolio.is-a.dev`, then **Save draft → Preview → Publish**. Do not reset unrelated published content just to change one field.
4. Verify canonical/`og:url` in the actual HTML response, `/api/site`, and `/api/resume/{html,text}`. The published profile is authoritative; redeploying intentionally does not replace it.
5. Sign in again on the new host. Keep cookies host-scoped and retain the existing same-origin/CSRF protections. Durable publishing still requires the private Blob setup in [ADMIN.md](ADMIN.md).
6. Only after the new host works, review obsolete Vercel domain entries and optional redirects with the owner. This work does not delete them or change their routing.

GitHub social links remain **`https://github.com/vikas-bhar`**. No portraits, project evidence claims, admin-menu behavior, or animation settings are changed by this domain preparation.

## Verify after registry approval

Run from a machine with DNS/HTTPS tools:

```bash
dig +short A vikas-portfolio.is-a.dev
dig +short TXT _vercel.vikas-portfolio.is-a.dev
curl -I https://vikas-portfolio.is-a.dev/
curl -fsS https://vikas-portfolio.is-a.dev/api/site
curl -fsS https://vikas-portfolio.is-a.dev/api/resume/text
```

Expected **after approval and propagation**, not already verified: A routes to the selected Vercel target, TXT matches the exact value above, Vercel ownership/DNS checks pass, HTTPS serves this portfolio, and the public profile/metadata/résumé URLs use the chosen name.

If the name is declined or claimed before submission, stop and choose another address with the owner. Do not reuse this TXT for a replacement name or submit another owner's existing registration. If application routing fails, keep a known working deployment accessible and roll back application/CMS URL changes separately; do not delete unrelated DNS records or weaken authentication.
