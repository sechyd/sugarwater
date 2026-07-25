# AGENTS.md

## Cursor Cloud specific instructions

This is a single Astro 5 + React app (the "Astro on Netlify Platform Starter"). It uses npm (`package-lock.json`) and Node.js. Standard commands live in `package.json` and `README.md`; prefer those.

### Services

- Only one service: the Astro web app. It demos Netlify Core Primitives (Blob Store `/blobs`, Edge Functions `/edge`, Image CDN `/image-cdn`, on-demand revalidation `/revalidation`). No database or other backing services are needed.

### Running

- `npm run dev` starts plain `astro dev` on `http://localhost:4321`, but the Blob Store / Edge / Image CDN features do NOT work in this mode (pages render a "context missing" alert).
- For full functionality, run `netlify dev` (Netlify CLI), which serves the app on `http://localhost:8888` and emulates Blobs/Edge/Image CDN locally. This works without `netlify login`/`netlify link` — no Netlify account is required for local dev.
- `netlify dev` proxies to the Astro dev server it spawns on port 4321; always hit the app on **8888** to exercise the Netlify primitives.
- `netlify-cli` is installed globally in the VM image (not tracked in `package.json`). If it is ever missing, install with `sudo npm install -g netlify-cli@latest`.

### Build / lint / test

- Build: `npm run build` (outputs to `./dist/`, includes SSR function via `@astrojs/netlify`).
- There is no lint script and no test suite configured. `npm run astro check` requires the extra `@astrojs/check` + `typescript` deps (not installed) and prompts interactively — avoid it unless those deps are added.

### Quick verification of the Blobs (core) feature

The Blob Store is the main data feature. Verify end-to-end against `netlify dev` (port 8888):

```
curl -s -X POST http://localhost:8888/api/blobs -H 'Content-Type: application/json' \
  -d '{"name":"test-shape","colors":["#f00","#0f0"],"seed":1}'
curl -s http://localhost:8888/api/blobs   # lists stored shape keys
```
