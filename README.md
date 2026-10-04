# Jaewon Kim — Markets & Investment Portfolio

A responsive static portfolio connecting rates and global market analysis with strategy validation, portfolio decisions, risk review, and account order-route tests. The page contains four selected projects; the complete project archive remains linked separately.

[Live portfolio](https://bucheoncityboy.github.io/markets-investment-portfolio/) · [Repository](https://github.com/bucheoncityboy/markets-investment-portfolio) · [Full project archive](https://github.com/bucheoncityboy/portfolio-index)

## Preview locally

Open `index.html` in a browser. The site has no build step or client-side JavaScript. To preview through HTTP, serve this directory with any static file server.

## Validate the site

Run from this directory:

```sh
bun run src/harness.ts
```

Node.js versions with native TypeScript support can also run:

```sh
node src/harness.ts
```

The harness checks the seven-section order, four project cards, eight process steps, verified figures and caveats, metadata, credentials, internal and repository links, contact privacy, responsive CSS, and Pages deployment configuration. Browser QA is still needed to inspect the actual layout at desktop and mobile widths.

Research figures describe project results within their stated assumptions. Account fill counts describe order-route tests and do not establish long-term investment performance. See [source notes](docs/source-notes.md) for evidence and limits.

## Publish with GitHub Pages

The repository uses **GitHub Actions** as its Pages source. The workflow deploys updates pushed to `main` or a manual **Deploy portfolio to GitHub Pages** run. Its artifact contains only `index.html`, `styles.css`, and `.nojekyll`.

The workflow uploads a Pages artifact and deploys it to the `github-pages` environment. No build tool or server runtime is required.

## Update the portfolio

Edit `index.html` for content and links, and `styles.css` for presentation. Keep the harness and source notes aligned with any changed claims. Project data and account test results must retain their research or testing qualifications.
