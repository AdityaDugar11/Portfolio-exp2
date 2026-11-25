# Aditya’s Notebook

A pencil-drawn engineering portfolio built with Astro and TypeScript. The page introduces Aditya Dugar, shows his pinned GitHub projects and links to his contact profiles. Select the illustrated computer to explore the notebook terminal.

## Run locally

Use Node 24. A clean checkout runs with these commands.

```sh
npm ci
npm run dev
```

Run `npm run build` to write the static site to `dist/`. Run `npm run preview` to inspect that build.

## Edit the notebook

The introduction lives in `src/pages/index.astro`. About and contact details live in `src/components/About.astro` and `src/components/Contact.astro`. The project index refreshes Aditya’s public GitHub pins at build time and uses its verified local edition when GitHub is unavailable. Set an optional build-time `GITHUB_TOKEN` to use the GraphQL API.

The handwriting fonts and images are served locally. Font licenses are in `public/fonts/LICENSES.txt`. The [frontend skills research](docs/frontend-skills.md) records the sources and design decisions.
