# Wiz Dog v0.9 — Building alignment / interior sprite correction

Focused revisions to the **v0.8** codebase and its existing artwork. Game title, cast, animation atlas, terrain, quests, abilities, audio, controls, dialogue sidebar, save key and farming remain as before.

## Entrances, exits and collision
- Created one `DOORWAYS` definition shared by exterior portal transitions, interior exits, building collision openings, and interior threshold display.
- Cottage: entrance is the art's doorway at farm `(6, 9)`; returning outside now lands at `(6, 10)` directly in front of the door.
- Seed Shop: the two visible doorway squares `(12, 8)` and `(13, 8)` both lead into the shop, aligned to interior exit squares `(9, 15)` and `(10, 15)` respectively. The old incorrect entry at `(11, 8)` is now a solid wall.
- Bakery: doorway at `(25, 8)` and `(26, 8)`, linked individually to indoor `(9, 15)` and `(10, 15)`.
- The library still has no explorable interior in this chapter; its facade remains blocked as before.
- Interior doors show an appropriately scaled **floor-level threshold** in the south wall rather than a tall external door sprite partially cut off at the edge of the viewport.
- The offscreen-quest exit marker was moved next to the indoor threshold so it no longer covers the wizard's body.

## Furniture / asset geometry
- Added 11 named sprites to the existing `interiors.png` atlas; metadata includes exact sprite coordinates.
- Fitted the bed, stove, table, bookcase and chest to their intended footprints **without stretching the original artwork out of proportion**.
- Moved Seed Shop bookshelves one tile down so the graphics are not cropped by the vertically scrolling camera, and matched map collision to their new positions.
- Corrected the bakery counter to an appropriately proportioned two-tile-high fixture, with matching collision.
- Kept the Seed Shop checkout functional; the original Moonleaf / Glowcap economy is untouched.
- Extended spellbook / kitchen interaction reachability after adjusting the visual furniture footprints.

## Regression testing
- Browser simulations: direct entry/exit through all five exterior doorway squares (one cottage, two shop, two bakery), back to correct exterior approach squares, collision at the formerly incorrect door tile, plus phone/tablet/desktop render previews.
- Full nine-quest progression, Sunny spell behaviour and game persistence test passed.
- Atlas coordinate bounds, nontransparent art, offline cache paths and archive integrity checked.

**Testing limitation:** These are automated Chromium checks and static image reviews, not an exhaustive test on every physical Android/iPhone/browser combination.
