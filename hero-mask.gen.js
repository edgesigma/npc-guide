// Generates hero-mask.png — an alpha mask: opaque (amber field shows) at the top,
// glitch-dissolving (1->0, noisy/scattered) toward the bottom. Used as a CSS
// mask-image on the hero's amber glyph-field so it dissolves below the copy.
// Run: NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node hero-mask.gen.js
const fs = require("fs"), path = require("path");
const { createCanvas } = require("canvas");
const W = 640, H = 900;
const cv = createCanvas(W, H), ctx = cv.getContext("2d");
const cell = 13, cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
const SOLID = 0.50;                 // top half fully opaque
const hash = (a, b) => { const s = Math.sin(a*12.9898 + b*78.233)*43758.5453; return s - Math.floor(s); };
ctx.clearRect(0, 0, W, H);
for (let j = 0; j < rows; j++) {
  const yf = j / rows;
  for (let i = 0; i < cols; i++) {
    let e;
    if (yf < SOLID) e = 1;
    else {
      const progress = (yf - SOLID) / (1 - SOLID);      // 0..1 down the dissolve band
      const thr = 0.12 + hash(i, j) * 0.88;             // scattered per-cell threshold
      e = 1 - (progress * 1.5) / thr - hash(i + 7, j * 3) * 0.06; // glitch erosion + flicker
      e = Math.max(0, Math.min(1, e));
    }
    if (e <= 0) continue;
    ctx.fillStyle = `rgba(255,255,255,${e.toFixed(3)})`;
    ctx.fillRect(i * cell, j * cell, cell, cell);
  }
}
fs.writeFileSync(path.join(__dirname, "hero-mask.png"), cv.toBuffer("image/png"));
console.log("wrote hero-mask.png");
