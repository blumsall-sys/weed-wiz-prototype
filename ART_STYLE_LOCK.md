# Wiz Dog — Phase 1 Style Lock (v0.8)

**Target:** warm Game Boy Color-era top-down fantasy farming/adventure, based on the established Weed Wizards artwork. New animal characters must appear to inhabit the existing environment, not a separate game.

- Keep 48 × 64 px RGBA actor animation cells and the complete 13-character, 4-direction, 3-frame animation registry; maintain exact names and order.
- Character sprites use the original hand-detailed chibi hats, clothing, backpacks, warm earth and forest-green palette, dark subtle outlines and low-resolution texture. No large flat emoji-like silhouettes or oversized heads.
- Sunny is a ginger cat; Peaches is a floppy-eared cream dog; Devin is an elderly silver-furred dog in the recognizable elder wizard robes, hat and beard.
- Other villagers are cats and dogs and retain the original merchant/farmer/traveller roles and costumes.
- Keep the existing environment, buildings, tree placement, UI, map layout, dialogue and visual/interaction scales completely unchanged without explicit user approval.
- Future character art changes require atlas-frame alignment testing, side-facing checks, palette comparisons against the prior artwork, and a regression smoke test of all nine quests.
