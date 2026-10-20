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

`src/art-style.js` holds the shared raster primitives, material treatment, tree painter, and house painter. The `furniture-art`, `creature-art`, `item-art`, `nature-art`, `outdoor-art`, `landmark-details`, and `phone-art` modules draw the corresponding families. Existing sprite factories keep their names, arguments, cache keys, and dimensions. Existing PNG overrides bypass procedural painting entirely.

The house, museum, landmarks, biome scenery, residents, wildlife, items, avatars, and phone icons share this vocabulary. Specialty forms that use their original painter receive the same material finish. Game rules, catalog contents, movement, placement footprints, and saved data are unchanged.

## Review

Preview sheets use integer scaling with smoothing disabled:

- [World and buildings](art-preview/world.png)
- [Furniture and interiors](art-preview/furniture.png)
- [Animals and collectibles](art-preview/animals.png)
- [Landmarks](art-preview/landmarks.png)

Run the existing logic tests with `npm test`. For the browser art checks:

```sh
npm ci
CHROMIUM_PATH=/usr/bin/chromium npm run test:art
```

Install Chromium separately if it is not available, then set `CHROMIUM_PATH` to its executable. The browser check renders 6,980 variants from the real registries, compares native dimensions and public exports with the original art, rejects new blank sprites, and checks pixel phone icons and PNG override behavior. It uses the pre-art commit `ef67b2f72cbe4d325adcc559d68d3e740ca0c9c1`; fetch that commit in shallow clones before running. `ART_BASE_REF` can select another available baseline when deliberately updating the comparison.

The phone still uses its emoji icons: in the first pixel version several apps shared one picture (Today and Mail, DIY and Tools, the whole bottom row). `src/phone-art.js` is kept but not used yet; give each of the 28 apps its own distinct picture before switching `src/phone.js` back to it.
