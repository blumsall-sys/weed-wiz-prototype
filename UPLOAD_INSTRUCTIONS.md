# Wiz Dog v0.9 — GitHub Pages update

1. Extract `Wiz_Dog_GitHub_Pages_UPLOAD_v0.9.zip`.
2. Upload the extracted **files and folders**, not the ZIP, to the root of your existing GitHub Pages repository. Keep `assets/`, `src/`, `index.html`, `sw.js`, and `manifest.webmanifest` at their supplied locations.
3. Commit. Under **Settings → Pages**, confirm deployment from `main` branch, root `/(root)` (or your current site configuration).
4. Reload the deployed page until the masthead shows **playable build v0.9**. Mobile devices may require closing the tab and reopening due to the prior service worker cache. Build v0.9 uses a new cache identifier.
5. Existing saves retain the previous v0.7 key and will load normally; no reset is needed. A new game may be useful when replaying the opening quest.

The package has fewer than 100 files and is suitable for GitHub's browser upload limit. For future updates, GitHub Desktop is a convenient alternative to dragging files into the site.

## Priority test cases
- From the garden: approach the cottage's visible door, walk up into the room, then exit through the single south-wall threshold. You should reappear immediately outside the door.
- In Mosswick: try both squares of the green-roof Seed Shop doorway; they should both enter correctly and use the matching indoor exit side.
- Repeat with both squares of the red-roof bakery door.
- Try stepping against the old incorrect doorway square left of the shop door. That square should now be solid.
- Walk around interior furniture, interact with the bed/spellbook/kitchen, and purchase seeds at Juniper's counter.
- Check mobile tap-to-move and tablet layout as in previous builds.
