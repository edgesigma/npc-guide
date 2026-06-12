// Generates og.png (1200×630 social share) and logo.png (512×512, for
// schema.org Organization.logo + apple-touch-icon) from the brand "Doh" mark.
// Run (from public-landing/):
//   NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node og.gen.js
const fs = require("fs"), path = require("path");
const { createCanvas, registerFont } = require("canvas");
registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", { family: "DejaVu Sans Mono" });

const BG = "#0a0907", AMBER = "#ffb000", DIM = "#b07a00", BONE = "#f0ebe5", LOW = "#5a3e00";
const LOGO = [
  "███▄    █  ██▓███   ▄████▄",
  " ██ ▀█   █ ▓██░  ██▒▒██▀ ▀█",
  "▓██  ▀█ ██▒▓██░ ██▓▒▒▓█    ▄",
  "▓██▒  ▐▌██▒▒██▄█▓▒ ▒▒▓▓▄ ▄██▒",
  "▒██░   ▓██░▒██▒ ░  ░▒ ▓███▀ ░",
  "░ ▒░   ▒ ▒ ▒▓▒░ ░  ░░ ░▒ ▒  ░",
];

function drawLogo(ctx, cx, topY, px) {
  ctx.font = `600 ${px}px "DejaVu Sans Mono"`;
  ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = AMBER;
  const maxW = Math.max(...LOGO.map(l => ctx.measureText(l).width));
  const x0 = cx - maxW / 2;
  LOGO.forEach((l, i) => ctx.fillText(l, x0, topY + i * px * 1.02));
  return LOGO.length * px * 1.02;
}

// ── og.png (1200×630) ──
(function () {
  const W = 1200, H = 630, cv = createCanvas(W, H), ctx = cv.getContext("2d");
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = LOW; ctx.lineWidth = 2; ctx.strokeRect(28, 28, W - 56, H - 56);
  const topY = 84, lh = drawLogo(ctx, W / 2, topY, 44);
  ctx.textAlign = "center";
  ctx.fillStyle = BONE; ctx.font = `500 30px "DejaVu Sans Mono"`;
  ctx.fillText("Real-world verification at a fraction of the cost.", W / 2, topY + lh + 64);
  ctx.fillStyle = DIM; ctx.font = `500 20px "DejaVu Sans Mono"`;
  ctx.fillText("npc.guide   ·   cleveland, cuyahoga county", W / 2, H - 58);
  fs.writeFileSync(path.join(__dirname, "og.png"), cv.toBuffer("image/png"));
  console.log("wrote og.png 1200x630");
})();

// ── logo.png (512×512) ──
(function () {
  const S = 512, cv = createCanvas(S, S), ctx = cv.getContext("2d");
  ctx.fillStyle = BG; ctx.fillRect(0, 0, S, S);
  drawLogo(ctx, S / 2, 215, 30);
  ctx.textAlign = "center";
  ctx.fillStyle = DIM; ctx.font = `500 22px "DejaVu Sans Mono"`;
  ctx.fillText("npc.guide", S / 2, 330);
  fs.writeFileSync(path.join(__dirname, "logo.png"), cv.toBuffer("image/png"));
  console.log("wrote logo.png 512x512");
})();
