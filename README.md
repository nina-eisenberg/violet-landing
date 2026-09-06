# Violet marketing site

The homepage includes the nine-stage fictional case journey, pricing, FAQ, and
contact form with a paper-airplane confirmation animation. About, Blog and its two articles,
Privacy, and Terms use the same marketing styles.

## Local development and production build

Use Node.js 22.12+ and run `npm ci`, then `npm run dev`.
Run `npm run build` to generate `dist/`; preview it with `npx vite preview`.

The build bundles the homepage, preserves the existing static HTML routes and
assets, and links content pages to the generated shared stylesheet. It fails if
a local stylesheet is missing. Edit content pages in their existing root or
`blog/` locations; shared marketing assets live at the repository root so the existing static
hosting setup and Vite both serve the same URLs.

`vercel.json` retains the existing clean URLs, training redirect, and state
rewrites. The prototype's Git repository and Sites hosting configuration are
not part of this import. Deployment remains a separate review/approval step.

## Contact verification

The submit button sends valid inquiries to the existing Formspree endpoint and
plays the paper-airplane animation after a successful response. The form asks
for name, email, optional organization, and audience/plan interest. Do not submit
valid test details to the real endpoint; verify success and failure with a mocked
network instead.
