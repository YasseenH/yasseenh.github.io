# Personal Website

Source for my personal site, built with [Astro](https://astro.build) and Tailwind v4.

- `DESIGN.md` — design system tokens (colors, type, spacing)
- `COPY.md` — approved page copy and SEO targets
- `src/pages/` — the 5 routes: Home, Experience, Projects, About, Contact

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Deployment

Deploys to GitHub Pages via the GitHub Actions workflow in
`.github/workflows/deploy.yml`.
