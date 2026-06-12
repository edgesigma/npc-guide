// Generates dither-tile.png — a seamless, tiling half-tone glyph texture in the
// brand character-cell idiom (dim ░▒▓ on near-black). Used as the repeating
// background of the inverted middle section so it breaks up the dark scroll
// WITHOUT a jarring light band. Dim on purpose: bone/amber copy must read over it.
// Run (from public-landing/):
//   NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node dither-tile.gen.js
const fs = require("fs"), path = require("path");
const { createCanvas, registerFont } = require("canvas");
registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", { family: "DejaVu Sans Mono" });

const BG = "#0a0907";
// SINGLE uniform value (no per-cell variation → no noise that competes with the
// copy): the sparsest shade glyph in one very dim warm tone, just above near-black.
const GLYPH = "░";
const COLOR = "#3a2a0a";   // one shade brighter than #1a1409 (which was too faint to see)
const fontPx = 20;
const COLS = 10, ROWS = 10;                             // any tile repeats seamlessly (cell-aligned)

const m = createCanvas(8, 8).getContext("2d");
m.font = `${fontPx}px "DejaVu Sans Mono"`;
const cw = Math.ceil(m.measureText("█").width), ch = Math.ceil(fontPx * 1.06);
const W = cw * COLS, H = ch * ROWS;
const cv = createCanvas(W, H), ctx = cv.getContext("2d");
ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
ctx.font = `${fontPx}px "DejaVu Sans Mono"`; ctx.textBaseline = "top";
ctx.fillStyle = COLOR;
for (let j = 0; j < ROWS; j++)
  for (let i = 0; i < COLS; i++)
    ctx.fillText(GLYPH, i * cw, j * ch);
fs.writeFileSync(path.join(__dirname, "dither-tile.png"), cv.toBuffer("image/png"));
console.log("wrote dither-tile.png", `${W}x${H}px (${COLS}x${ROWS} cells)`);
