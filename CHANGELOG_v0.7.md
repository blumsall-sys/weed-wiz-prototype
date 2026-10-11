# Wiz Dog v0.7 — Paws & Potions

- Rebranded Weed Wizards to **Wiz Dog** throughout title, header, manifest, and PWA cache.
- Added start-of-game character selection, persisted in saves:
  - **Sunny the Cat:** Moon Eyes — longer spells, faster focus recharge, third normal cast free.
  - **Peaches the Dog:** Guardian Bark — spell pulse repels close crop pests, in addition to directional light.
- Replaced the player sprite renderer and village NPC sprites with a pixel-aligned animal atlas: cats and dogs, including old-dog wizard **Devin**.
- Rewrote mentoring/story dialogue to fit a magical animal world, with hints of blight farmers and enchanted mushrooms.
- Standardized action terminology: on-screen **A** is the interaction key (keyboard Z/Enter), **B** is cast/back (keyboard X/Backspace). Movement stays WASD, desktop arrow keys, and mobile tap-to-walk.
- Added quest 9 of the first chapter, **Guard the Green Patch** (three pests plus a masked blight farmer). Defeat/rebuff these threats with light spells. They slowly approach/nibble planted crops; tutorial cannot be permanently failed.
- Added glowing **Glowcap mushrooms**: spores can be bought from Juniper for 5 coins, equipped from Bag, planted and watered, grown across days, and harvested to earn +3 focus-free casts and XP. Moonleaf still grows/harvests as before.
- Updated quests, HUD, goals, saved game migration, and quest targeting. Touchscreen taps on hostile targets approach and face them for B attacks.
- Old v0.6 saves can be imported as Sunny via Continue; the old free-play stage becomes the new defense quest.
- Preserved environment/roof/tree fixes, dialogue docking, shop functionality, lo-fi music, sound effects, narration, and mobile layout from v0.6.

## Test summary

Automated in-browser (inlined local assets): character selection; atlas loading; arrow movement; Guardian Bark; Sunny projectile hits and free third cast; seed-shop spore purchasing, planting and harvesting; nine-quest progression; save persistence; desktop, tablet, portrait and landscape responsive-width checks; no JavaScript exceptions.

Not tested physically on your particular Android or iPhone. The new pixel character art is a first functional draft; animation and anatomy can be further refined.
