# Yu-Gi-Oh Favorite Cards Challenge

Interactive web mini-project to build and export a Yu-Gi-Oh themed infographic of your favorite cards.

You can:
- upload your own images manually,
- auto-fill slots with random cards from YGOPRODeck,
- export the final visual as a PNG via `html2canvas`.

## Features

- 9 categories (Deck/Boss, Normal, Effect, Ritual, Fusion, Synchro, Xyz, Pendulum, Link)
- Manual upload for each card slot
- Random mode based on YGOPRODeck API
- Dynamic label switch: `Favorite Deck` -> `Favorite Boss Monster` in random mode
- High-resolution PNG export
- Session cache for random pools (`sessionStorage`)
- Keyboard-accessible card slot interactions

## Project structure

- `index.html`
- `style.css`
- `script.js`
- `tailwind-input.css`
- `tailwind.config.js`
- `tailwind.css` (generated)
- `postcss.config.js`
- `package.json`
- `AUDIT_REPORT.md`

## Quick start (local)

1. Clone/download this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Build Tailwind CSS:

```bash
npm run build:css
```

5. Start a local static server (recommended), for example:

```bash
npx serve .
```

6. Open the served URL in your browser (for example `http://localhost:3000`).

## Automated tests (E2E)

Install Playwright browser once:

```bash
npx playwright install chromium
```

Run the desktop + mobile test suite:

```bash
npm run test:e2e
```

You can also open `index.html` directly, but a local server is more reliable for browser security behavior and asset loading consistency.

## Usage

1. Click a card slot to upload an image.
2. Repeat for all categories, or click `Duel Roulette` for random cards.
3. Click `Download my Infographic` to export.
4. Use `Reset` to clear all slots.

## Deploy on GitHub Pages

This project is static and works on GitHub Pages without build tooling.

1. Push repository to GitHub.
2. Go to `Settings` -> `Pages`.
3. In `Build and deployment`, select:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.
5. Open the generated GitHub Pages URL.

## API and external dependencies

- Card data API: `https://db.ygoprodeck.com/api/v7/cardinfo.php`
- Rendering export: `html2canvas@1.4.1`
- Icons: `lucide@0.468.0`
- Styling: local Tailwind build (`tailwindcss@3.4.17`) generated into `tailwind.css`

## Known limitations and risks

- The app depends on YGOPRODeck availability and response time.
- Random mode may partially fail if some API requests fail; app now degrades gracefully.
- Exported canvas can fail if remote images become blocked by CORS policy changes.
- Random images are hotlinked from external hosts; if host/CDN changes, image loading or export may break.
- If you change markup/classes, regenerate `tailwind.css` (`npm run build:css`).

## Caching behavior

- Random category pools are cached in `sessionStorage` for the current browser tab session.
- Cache key: `ygo-card-challenge-cache-v1`.
- Closing the tab/browser may clear session cache behavior depending on browser settings.

## Upload constraints

- Allowed formats: `JPG`, `PNG`, `WEBP`
- Maximum file size: `5 MB`
- Invalid files are rejected with a user-facing warning.

## Troubleshooting

- **Random mode fails**:
  - Check internet connection.
  - Retry after a few seconds (rate limit or temporary API issue).
- **Export fails**:
  - Wait until all images are visible/loaded.
  - Retry if remote images are temporarily unavailable.
  - If CORS blocks an external image source, try manual upload from local file.
- **UI not styled correctly**:
  - Verify external CDNs are reachable.
  - Reload page with cache bypass (`Ctrl+F5` / `Cmd+Shift+R`).

## Security notes

- A strict `Content-Security-Policy` is enforced in `index.html` (no inline script dependency).
- Tailwind is built locally, which reduces third-party script exposure and simplifies CSP hardening.

## License and disclaimer

- This project is a fan-made UI template.
- Card artworks, names, and Yu-Gi-Oh related IP belong to their respective rights holders.
- Ensure your public usage respects copyright and platform policies.
