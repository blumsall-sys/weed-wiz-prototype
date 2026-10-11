# Wiz Dog v0.8 — GitHub Pages Testing

This ZIP is a deployable static web application. No framework, build step, backend, API key, or package installation is needed.

## Update your existing GitHub Pages repository
1. Download and extract `Wiz_Dog_GitHub_Pages_UPLOAD_v0.8.zip`.
2. Open your existing Wiz Dog repository on github.com.
3. Upload the **contents** of the extracted folder to the repository's root. Keep `index.html`, `sw.js`, `manifest.webmanifest`, `src/`, and `assets/` in their relative locations. Do not upload the ZIP as one file, and do not put everything inside a `Wiz_Dog_v0.8/` subfolder.
4. Commit the replacement/changed files. If the web uploader is inconvenient, use GitHub Desktop to copy the extracted files over your cloned repository, commit, and push.
5. Keep GitHub Pages configured to publish from your existing `main` branch / `(root)` directory and wait for deployment.
6. Open your existing GitHub Pages URL. Confirm the header says `playable build v0.8`.

## Local Windows testing
Open `index.html` in Chrome. All resources are local and do not require a running server. Audio on mobile may require a user-initiated tap, according to browser autoplay policy.

## Cache and save games
- Service-worker cache name is now `wiz-dog-build-v08`. Older caches are retired when the browser activates the new service worker.
- Reload the deployed page twice if it still shows v0.7. You can also refresh without using cached content.
- Don't clear the website's local storage if you want to keep your save. The save key is intentionally unchanged from v0.7.

## Scope of this version
Only animal artwork, portraits, app icons, the displayed build number and related caching metadata changed. World art, controls, interface placement, dialogue, music, game mechanics and quests are unchanged.
