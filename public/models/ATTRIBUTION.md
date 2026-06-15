# Mockup 3D model attribution

Models in this folder are served same-origin for the custom-printing mockup editor.

| File | Source | License |
|------|--------|---------|
| `shirt_baked.glb` | [Starklord17/threejs-t-shirt](https://github.com/Starklord17/threejs-t-shirt) | MIT |
| `hoodie.glb` | [hiriski/react-3d-custom-product-designer](https://github.com/hiriski/react-3d-custom-product-designer) (`src/assets/3d/hoodie.glb`) | MIT (per project README) |
| `hoodie_baked.glb` | Derived from `hoodie.glb` via `gltf-transform` (Draco removed, mesh simplified for the editor) | Same as source |
| `baseball_hat_028.glb` | [jmcgregor — Baseball Hat 028](https://sketchfab.com/3d-models/baseball-hat-028-d9edc7c821f44c65a4f68e2509f04e6d) on Sketchfab (source) | [CC Attribution](https://creativecommons.org/licenses/by/4.0/) |
| `cap_baked.glb` | Derived from `baseball_hat_028.glb` via `scripts/bake-cap-glb.mjs` (textures stripped, artist UVs kept) | Same as source |
| `mug_sublimation_source.glb` | [GRAPHIC.DESIGN.STUDIO — Coffee Mug for Sublimation](https://sketchfab.com/3d-models/coffee-mug-for-sublimation-420ab98bf6fd494ba90b698e06c18179) on Sketchfab | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `mug_baked.glb` | Derived from `mug_sublimation_source.glb` via `scripts/bake-mug-glb.mjs` (print island → layout atlas, overlay texture stripped) | Same as source |

`hoodie_baked.glb` is used in production so the mockup editor does not need Draco WebAssembly under a strict Content-Security-Policy.

Replace these with brand-accurate garment meshes when ready.
