# Wiz Dog v0.10 — Hearts, Damage, Respawn and Interactive Maps

This is a focused update of the v0.9 GitHub Pages build. All previously shipped art, tile/character atlases, 9 quests, narration, audio, shop purchases, controls, interior/exterior doorways, and mobile tap navigation are preserved.

## Health and survival

- Five large, live heart icons appear in Apprentice Status, plus a compact five-heart row in the game viewport.
- The status area retains the existing health bar and now includes a count of how many times the character has fainted.
- Hungry snails inflict 1 heart of damage when adjacent; during the garden-defense mission, crop pests inflict 1 heart and the blight farmer inflicts 2 hearts.
- A temporary 2.2-second protection window after a hit prevents unfair back-to-back damage. Hit flashes are brief and do not alter the environment.
- At 0 hearts, play pauses at a **You fainted!** prompt. The player can wake at their cottage with 5 hearts and full spell focus. Fainting costs at most 2 coins, **but never deletes crops, seeds, quests, skills, or other progression**. The faint count is saved.
- Sleeping restores all hearts as it already did. Existing saves (key `wiz-dog-save-v07`) remain compatible, with new data fields initialized automatically.

## Bram's bakery

- **Bram outside** gives one complimentary bun per in-game day, restoring up to 2 hearts. He won't waste a free bun when you're already at full health.
- **Bakery counter** still charges 2 coins and now truly heals you to full (5/5). It does not charge you at full health. The dialogue correctly describes how many hearts were restored.
- Healing and currency changes update the HUD and are saved immediately.

## World maps

- The Map panel now renders an actual top-down pixel overview of the original terrain for each discovered scene, not merely text descriptions.
- Visit and select The Green Patch, Your Cozy Den, Mosswick Village, Juniper’s Seed Shop, and Bram’s Bakery to unlock their map buttons.
- Markers indicate the current player, residents and outdoor/indoor entrances. Locked locations stay hidden until discovered; future areas remain labelled as upcoming chapters.
- A compact, responsive map chooser shows the full schematic at desktop, tablet, and phone widths.

## Scope and regression checks

- Changes limited to `src/game.js`, `src/style.css`, `index.html`, `sw.js`, and this documentation.
- Same character-selection system and hero bonuses, gardening, quest sequence, animal cast, effects, art, sounds, building-door alignment, movement and save storage.
- Automated in-browser test checks: actual rendered map pixels, unlock and switching between discovered maps, health visibility, damage and cooldown, faint/respawn, bakery healing with currency checks, save/load, nine-quest progression, snail and blight-farmer contact damage, and JavaScript console errors at desktop/tablet/phone sizes.
- GitHub service-worker cache changed to `wiz-dog-build-v010`; the masthead reads **playable build v0.10**.

## Remaining device testing

Full graphical rendering, speech audio, and touch interactions should still be tested on your physical Android tablet and iPhone. Automated checks used Chromium desktop in multiple viewport sizes, not physical devices.
