# Assets

Static assets imported by components (logos, illustrations, fonts that are not
package-managed).

- Prefer inline SVG components (see `components/layout/Logo.tsx`) for icons that
  need to inherit theme colours.
- Files placed here are processed by Vite (hashed, inlined when small).
- Files that must keep a stable URL (favicon, robots.txt, OG images) belong in
  the top-level `public/` folder instead.
