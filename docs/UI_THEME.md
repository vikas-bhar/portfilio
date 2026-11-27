# Editorial studio UI theme

The public portfolio adopts the warm editorial / creative-studio direction of the [supplied UI reference](https://enosh-portfolio-six.vercel.app/creative-work): charcoal, parchment, mustard details, expressive headings, understated category filters, and artwork-led project captions.

This is a **presentation change**, not a content import or a deployment/domain change.

## Implementation

- `src/styles/base.css`: shared warm dark/light palette and type tokens.
- `src/styles/paper.css`: shared, public-scoped stationery primitives. Projects and supporting cards use the same warm ink/paper tokens, textured torn-paper backing, mounted print/grid/tape, numbered stamps, mustard labels, and dark chips. Only the decorative backing is clipped, not content or focus rings; no extra wrapper replaces the original motion layers.
- `src/styles/studio.css`: public typography, section/card layouts, navigation, résumé viewer, and responsive rules. It replaces the previous `simple.css` presentation layer.
- `src/components/PaperIcon.tsx`: small, locally rendered Lucide icon prints for capabilities, focus areas, milestones, and the contact form. The entire print, including its decorative number, is hidden from assistive technology. These are decorations, not project images, working-UI captures, credentials, or new claims.
- `src/styles/fonts.css`: self-hosted Latin variable DM Sans (body), Bricolage Grotesque (headings), Fraunces (editorial nameplates), plus the existing Geist/Geist Mono fonts. The font packages include their OFL licenses.
- `src/components/HeroArtwork.tsx`: original, decorative notebook drawing built from inline SVG and the existing build-path content. It is hidden from assistive technology and omitted at small viewport sizes.
- `public/paper-grain.svg`: original repeatable procedural paper texture; no remote image requests.
- `Hero.tsx`: the existing name and role presented as cut-paper nameplates. The heading text still comes entirely from the editable profile.
- `Projects.tsx` / `src/styles/project-archive.css`: the reference home page’s Projects layout, adapted as a searchable two-column archive of torn-paper project files. Each file pairs a numbered mounted illustration/capture with its category, title, summary, technology chips, and an arrow disclosure. The existing editable heading/introduction remain in use; no reference project content or assets are imported.
- `src/lib/projects.ts`: case-insensitive, Unicode-normalized, multi-keyword matching across the published project fields. Search and category filters work together; counts, clear/Escape, empty-state reset, and keyboard focus recovery are supported. Hidden projects are excluded before searching.
- `ProjectCard.tsx`: independent in-place details instead of inventing case-study destinations. Genuine captures, illustration labels, original demo/source availability, and request-access actions remain separate and honest.

## Consistent sections and boxes

The Projects design is not an isolated theme. `paper-card`, `paper-mount`, `paper-print`, `paper-index`, `paper-label`, and `paper-chips` are shared by the archive and the supporting public UI:

- Capabilities pair numbered icon prints with the existing pillar titles, descriptions, and technology chips. The architecture note is a small paper strip.
- About uses separate paper files for the existing biography, computed statistics, and focus areas, rather than putting otherwise different boxes inside one large cream background.
- Experience/milestone cards retain their categories, organizations, descriptions, and highlights; no dates or achievements are added.
- Contact has matching paper invitation and form cards. Labels, validation, copy-email feedback, and the honest email-draft handoff remain functional.
- The optional hero build path, footer strip, navigation disclosure, project empty state, and résumé cards use the same stationery. The native résumé dialog keeps its own scrolling and keyboard focus behavior.

Like the Projects archive, paper surfaces deliberately stay cream with dark ink in **both** themes; the surrounding canvas and browser chrome switch between charcoal and parchment. Responsive layouts preserve the card treatment instead of removing borders/backgrounds on mobile. All text still comes from the same content provider, including edited/reordered/additional rows. The private Admin workspace is not restyled.

## Preserved behavior

All eleven factory projects and four flagships, their order/visibility, evidence labels, illustrations and genuine-capture support are unchanged. No images or project descriptions were taken from the reference. No developer portrait was restored.

The original scene, wires, floats, pointer tilt, reduced-motion preference, WebGL fallback, and owner animation switch remain. Theme choice still persists, both themes remain available, and existing published appearance settings remain authoritative. The factory accent defaults are now mustard/rust; stored CMS content is not reset or rewritten.

Admin access remains **three-line menu → Admin login**, never a standalone public link. Authentication, server-side drafts/private preview/publishing, metadata, dynamic résumés, contact-mail handoff, and domain-registration files are unchanged. No Vercel project settings, domains, redirects, or deployments are modified by this theme.

## Checking changes

```sh
npm run check
npm run build
npm run test:e2e
```

The browser suite checks desktop/mobile layouts, navigation, keyboard interactions, project expansion, published content, theme persistence, motion fallbacks, contact/résumé behavior, and axe accessibility in both palettes. The `studio-theme` checks cover editorial typography and overall reflow. `paper-sections` additionally verifies shared card/print/label/chip styles in both themes, expanded-card content bounds from 320px through 1920px, accessible optional build-path details, matching menu/résumé cards, and separation from the private editor. Component tests preserve edited/reordered/additional content and decorative-only icon semantics.
