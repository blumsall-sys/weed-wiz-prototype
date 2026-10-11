# Wiz Dog v0.8 — Animal Character Style Continuity

## Purpose
This is a narrow artwork-only correction to v0.7, restoring the established retro handheld pixel-art treatment from Weed Wizards (prior to the simplified animal cast). There is no redesign of terrain, buildings, interface or underlying gameplay.

## Changes
- Rebuilt the complete 13-character, 156-frame animal atlas using the original detailed character artwork as the base, retaining its hats, clothing, outline density, shading and silhouette scale while adapting faces, ears and tails for cats and dogs.
- Updated the individual character-preview PNGs for Sunny, Peaches and Devin to match the atlas.
- Rebuilt the two PWA icon sizes with the updated character art.
- Updated the visible build number to v0.8, URL cache-busting query strings and the service-worker cache version so GitHub Pages will fetch the new images.

## What did NOT change
- `src/game.js` is **byte-for-byte identical to v0.7**. Includes both player abilities, all nine quests, farming, shop, mushroom crops, defense, mobile tap movement, save compatibility, dialogue, narration, collisions and game mechanics.
- `src/style.css` is **byte-for-byte identical to v0.7**. The interface, controls, layout, text and screen structure are unchanged.
- Environment, tree, building, interior, crop, item, UI and NPC legacy atlases are unchanged.
- Atlas coordinates, 48 × 64 animal animation cell layout, names and JSON registry are unchanged.
- Music and sound effects are unchanged.
- The save-game key remains `wiz-dog-save-v07`, allowing v0.7 saves to carry forward.

## Sprite layout
- `assets/atlas/animals.png`: 576 × 3328 RGBA PNG, containing 13 actors × 4 directions × 3 frames = 156 animation cells.
- `assets/atlas/atlas-data.js`: unchanged lookup, 48 × 64 pixel animal cells.
- Hero/NPC sprites are rebuilt to the existing footprint, so movement, orientation and collision values are unaffected.

## QA
- Browser-based smoke testing with inlined local PNG/JS/CSS at desktop, tablet, phone portrait and phone landscape sizes. All four configurations loaded all atlases, passed character selection, rendered the game, had no horizontal overflow, and recorded no JavaScript exceptions.
- Full nine-quest test (cottage, Devin, seeds, planting, watering, town, snail, wand, crop defense) passed.
- Verified all 156 animation cells have nonempty alpha data.
- Compared file hashes against v0.7 to confirm unchanged game code, CSS, world tiles, buildings, interiors, items, music, and atlas registry.
- Physical Android/iPhone testing remains to be performed on the user's devices.
