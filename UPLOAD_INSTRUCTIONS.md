# Weed Wizards v0.6 - GitHub Pages installation

1. Extract **Weed_Wizards_GitHub_Pages_UPLOAD_v0.6.zip** on Windows.
2. Open your existing GitHub repository (the one hosting the current Weed Wizards test) and choose Add file > Upload files.
3. Drag the **contents** of the extracted folder into the GitHub web uploader, keeping `index.html` at repository root and preserving `src/` and `assets/` subdirectories. Upload the files, not the ZIP.
4. Commit to the branch deployed in Settings > Pages. Wait for Pages publishing to finish.
5. Open the GitHub Pages address with `?build=v06` appended, e.g. `https://YOUR-USER.github.io/YOUR-REPO/?build=v06`.
6. If a previous cached build still appears, perform Ctrl+Shift+R in desktop Chrome, or remove that site's stored website data / unregister the Weed Wizards service worker under browser Site Settings. Reopen the v0.6 URL after the site is updated. You should see `/ playable build v0.6` at the top.

This upload includes a lightweight, static playable website; it is under GitHub's 100-file web-upload batch limit. For routine updates you can also use GitHub Desktop to commit/push whole folders without the browser batch limit.

## Shop test
Play/continue, travel east to Mosswick, enter Juniper's shop and approach the front edge of the central counter. Press Z (or tap the counter). Buy a seed, check that coins decrease and seeds increase in Apprentice Status. Close the menu and continue. You can also reach the counter with tap-to-move.

## Browser speech
Optional TTS is built into Chrome/Safari; no cloud API or subscription. It may require a gesture to start playback on mobile.

## Developer pack
The separate EDITABLE Windows ZIP contains source art, individual PNG sprites, a repacker and tests. To create the lightweight upload directory from the full source later, run `py tools/build_github_package.py` (Python 3) and upload the generated `github-pages-upload/` contents.
