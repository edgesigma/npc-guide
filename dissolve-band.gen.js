// Generates dissolve-band.png — a near-black glitch band: transparent at the top,
// glitch-dissolving (noisy/scattered) to fully near-black at the bottom. Laid as a
// background-image OVER the amber CSS grid at the bottom of the hero, so the field
// dissolves into the page. Plain background-image (not a mask) → works over file://.
// Run: NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node dissolve-band.gen.js
const fs = require("fs"), path = require("path");
const { createCanvas } = require("canvas");
const W = 820, H = 320, pitch = 21;
const cv = createCanvas(W, H), ctx = cv.getContext("2d");
const cols = Math.ceil(W / pitch), rows = Math.ceil(H / pitch);
const hash = (a, b) => { const s = Math.sin(a*12.9898 + b*78.233)*43758.5453; return s - Math.floor(s); };
ctx.clearRect(0, 0, W, H);
for (let j = 0; j < rows; j++) {
  const yf = (j * pitch) / H;                          // 0 top -> 1 bottom
  for (let i = 0; i < cols; i++) {
    const thr = 0.12 + hash(i, j) * 0.88;              // scattered per-cell threshold
    let c = yf * 2.0 - thr * 0.8 - hash(i + 7, j * 3) * 0.06; // coverage: 0 top, 1 bottom, glitch
    c = Math.max(0, Math.min(1, c));
    if (c <= 0) continue;
    ctx.fillStyle = `rgba(10,9,7,${c.toFixed(3)})`;    // near-black, alpha = coverage
    ctx.fillRect(i * pitch, j * pitch, pitch, pitch);
  }
}
fs.writeFileSync(path.join(__dirname, "dissolve-band.png"), cv.toBuffer("image/png"));
console.log("wrote dissolve-band.png");
