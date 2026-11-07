# Penpal Pixel

Penpal Pixel is a Next.js app for writing cozy pixel-art letters and building
photo scrapbooks. It includes a letter preview route, local draft storage,
scroll-linked village parallax, reversible section reveals, and reduced-motion
support. GSAP powers the pixel cursor and interaction details; Lenis smooths
desktop wheel scrolling while touch and reduced-motion preferences keep native
scrolling. The scene stays CSS/SVG-based rather than adding a WebGL background.
The downloadable letter remains a self-contained HTML file that can be shared
outside the app.

## Run locally

Use Node.js 20.9 or newer:

```sh
npm install
npm run dev
```

Open the address printed by Next.js. For a production build, run
`npm run build`; Next.js writes the static site to `out/`. To preview that
build locally, run `python3 -m http.server 4173 --directory out`.

## Deploy on GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the
static export when changes reach `main`. Enable GitHub Pages with GitHub Actions
as the repository's deployment source. The build derives the correct
repository subpath automatically, so project Pages URLs and user-site URLs
both work. The workflow runs `npm audit` before publishing and uses narrowly
scoped GitHub permissions; no personal access token or app secret is needed.
The static export includes a sitemap for the public home page. After deploying,
submit its `sitemap.xml` URL in Google Search Console; Google controls when and
whether a site appears in search results.

Drafts and theme preferences are stored by the browser for each origin. A draft
is stored locally in the browser. Letters are downloaded as files for you to
share; the site does not send them directly.
