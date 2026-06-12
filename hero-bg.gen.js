// Generates hero-bg.png with REAL GLYPHS — the brand character-cell field:
// solid amber █ at the top, glitch-dissolving DOWN the 0->1 ramp
// (█ ▓ ▒ # * + = - : · space) toward the bottom. Same engine/look as the video
// pipeline. Baked to a PNG and used as a plain background-image (works over file://).
// Run: NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node hero-bg.gen.js [out] [W] [H] [SOLID]
//   mobile/portrait : node hero-bg.gen.js hero-bg.png 760 1280 0.66
//   desktop/wide    : node hero-bg.gen.js hero-bg-wide.png 1680 1040 0.58
const fs = require("fs"), path = require("path");
const { createCanvas, registerFont } = require("canvas");
registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", { family: "DejaVu Sans Mono" });

const OUT = process.argv[2] || "hero-bg.png";
const W = +(process.argv[3] || 760), H = +(process.argv[4] || 1280);
const SOLID = +(process.argv[5] || 0.66);               // top fraction that stays solid amber █
const cv = createCanvas(W, H), ctx = cv.getContext("2d");
const RAMP = [" ", "·", ":", "-", "=", "+", "*", "#", "▒", "▓", "█"], N = RAMP.length - 1;
const AMBER = "#ffb000", DIM = "#b07a00", BG = "#0a0907";
const fontPx = 22;
const hash = (a, b) => { const s = Math.sin(a*12.9898 + b*78.233)*43758.5453; return s - Math.floor(s); };

ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
ctx.font = `${fontPx}px "DejaVu Sans Mono"`;
ctx.textBaseline = "top";
const cw = Math.ceil(ctx.measureText("█").width);
const ch = Math.ceil(fontPx * 1.06);                    // subtle line gap -> the "slightly visible gaps"
const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);

for (let j = 0; j < rows; j++) {
  const yf = (j * ch) / H;
  for (let i = 0; i < cols; i++) {
    let e;                                              // 1..0 intensity
    if (yf < SOLID) e = 1;
    else {
      const p = (yf - SOLID) / (1 - SOLID);            // 0..1 down the dissolve band
      const thr = 0.12 + hash(i, j) * 0.88;            // scattered per-cell threshold (glitch)
      e = 1 - (p * 1.55) / thr - hash(i + 7, j * 3) * 0.05;
      e = Math.max(0, Math.min(1, e));
    }
    const k = Math.floor(e * N);
    if (k <= 0) continue;                               // empty -> near-black shows
    ctx.fillStyle = k >= 8 ? AMBER : DIM;              // heavy glyphs bright, light ones dim
    ctx.fillText(RAMP[k], i * cw, j * ch);
  }
}
fs.writeFileSync(path.join(__dirname, OUT), cv.toBuffer("image/png"));
console.log("wrote", OUT, `${cols}x${rows} cells`);
