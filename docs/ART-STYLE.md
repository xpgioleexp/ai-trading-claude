# Dimensional pixel art

Use [ASSETS.md](ASSETS.md) for sprite names, native dimensions, palette, anchors, and PNG overrides. Those contracts still apply.

The style stays 2D, with depth drawn into the pixels:

- Show a light top, a warm front, and a darker receding right side on buildings, furniture, containers, and stones.
- Use pitched roofs, side windows, beveled rims, and overlapping leaves to describe volume. Keep the upper-left light consistent.
- Give trees asymmetric clusters, scalloped edges, curved trunks, and visible roots. Keep grass quiet so objects remain readable.
- Use stepped silhouettes, small highlights, and restrained material details. Never blur or enlarge the source canvas to add detail.
- Draw subtle contact shadows behind standing objects, inside their original canvas. Preserve ground anchors and animation frames.
- Keep animals recognizable by their bodies, ears, shells, wings, and tails. Marimo remains a textured moss ball.

## Where to work

`src/art-style.js` holds the shared raster primitives, material treatment, tree painter, and house painter. The family painters and their detail modules draw furniture, walls, animals, collectibles, garden plants, outdoor pieces, landmarks, props, repeating tiles, and phone icons. Existing sprite factories keep their names, arguments, cache keys, and dimensions. Existing PNG overrides bypass procedural painting entirely.

The house, museum, landmarks, biome scenery, residents, wildlife, items, avatars, and phone icons share this vocabulary. Every registered form has a redesigned painter; the old placeholder drawing branches have been removed. Crafted-item icons depict the actual furniture or decoration. Food, material, fish, bug, and fossil icons follow their object or body plan instead of sharing an unrelated generic symbol. Fossil assemblies include connected anatomy even when a collectible combines multiple body sections.

Game rules, questions, missions, catalog contents, movement, placement footprints, and saved data are unchanged.

## Review

Preview sheets use integer scaling with smoothing disabled:

- [Original versus redesigned](art-preview/comparison.png)
- [World and buildings](art-preview/world.png)
- [Furniture and interiors](art-preview/furniture.png)
- [Animals and collectibles](art-preview/animals.png)
- [Landmarks](art-preview/landmarks.png)
- [All 28 distinct phone icons](art-preview/phone.png)

Run `npm start` and open `http://localhost:4173/docs/art-preview/` to browse all 6,980 variants. The gallery supports search, family filters, pagination, and hiding identical renders. It is a development preview, separate from the game.

Run the existing logic tests with `npm test`. For the browser art checks:

```sh
npm ci
CHROMIUM_PATH=/usr/bin/chromium npm run test:art
```

Install Chromium separately if it is not available, then set `CHROMIUM_PATH` to its executable. The browser check renders 6,980 variants from the real registries, compares native dimensions and public exports with the original art, rejects new blank sprites, and checks pixel phone icons and PNG override behavior. It also renders the entire set with the shared material finish disabled: every variant must still differ from the original. Direct painter checks reject unsupported or empty furniture, walls, items, outdoor forms, scenery, decorations, landmarks, jar objects, repeating patterns, and animal body plans, preventing a return to the old placeholders.

The test uses the pre-art commit `ef67b2f72cbe4d325adcc559d68d3e740ca0c9c1`; fetch that commit in shallow clones before running. `ART_BASE_REF` can select another available baseline when deliberately updating the comparison.

Each of the 28 phone apps must have its own distinct pixel picture before the pixel icons are enabled. The browser check enforces that requirement.
