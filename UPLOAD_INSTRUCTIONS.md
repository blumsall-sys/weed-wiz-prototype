# Wiz Dog v0.10 — GitHub Pages upload

1. Download and extract `Wiz_Dog_GitHub_Pages_UPLOAD_v0.10.zip` on Windows.
2. Open your current GitHub Pages repository and upload the **extracted files/folders**, **not the ZIP**, to the repository root. Preserve the supplied `assets/` and `src/` paths. You must replace the previous `index.html`, `src/game.js`, `src/style.css`, and `sw.js` files.
3. Commit the changes. Your Pages source should remain set to its existing branch and `/ (root)` folder.
4. Refresh the published URL and confirm the heading reads **playable build v0.10**. If old code persists, hard refresh or close/reopen the tab. The service worker has a fresh cache name.
5. **Do not clear browser site data or reset your saved game.** Your existing save remains compatible and should load with all quests, character, inventory and crop progress.

The deployment ZIP has fewer than 100 files, so you can upload it through GitHub’s web upload page. For many future revisions, GitHub Desktop is easier than repeatedly dragging folders into the browser. The `index.html` file must be at the repository root, not wrapped in another folder.

## Test checklist

- On a new or continued game, look for **five red hearts** both near the upper-left of the playfield and in **Apprentice Status**.
- At Bram outside the bakery, after taking damage, talk to him: the daily free bun heals up to two missing hearts. The bakery counter heals to full for two coins; neither option wastes healing at full health.
- Let the hungry snail touch the player (or take hits during the crop-defense quest). Hearts go down, with a short grace period between hits.
- When hearts reach zero, choose **Wake up in your cottage**. Your hearts refill, the coin cost is at most 2, and the active quest and planted crops are unchanged.
- Open the **Map** from the toolbar. The Green Patch should render an actual minimap. Visit Mosswick and return to Map; select both discovered outdoors areas. Enter your cottage and the shops to reveal and select their indoor maps.
- Check sound, spoken dialogue, touch movement, shop purchases, wand spells, building entry/exit, and the remaining quests for regressions.

This is a static, no-build project. It also runs locally by opening `index.html` in Chrome. Browser speech and sound depend on user gestures and available device voices.
