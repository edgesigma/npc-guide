// Generates the Phase-2 hero background: CUYAHOGA COUNTY rendered as a lit
// region of the brand glyph-field. Inside the county the character-cells fill
// solid amber █ (textured by the same glitch dither as the video pipeline);
// outside they dissolve to near-black. The county boundary is traced bright,
// a ◉ marks downtown Cleveland, and the county is labeled. The county is
// placed on the LEFT so page copy overlays the dark right half on desktop.
//
// Run (from public-landing/):
//   NODE_PATH=../prototypes/ascii-glyph-field/export/node_modules node hero-county.gen.js
// which bakes both the desktop-wide and the mobile/portrait variants.
const fs = require("fs"), path = require("path");
const { createCanvas, registerFont } = require("canvas");
registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", { family: "DejaVu Sans Mono" });

const AMBER = "#ffb000", DIM = "#b07a00", LOW = "#5a3e00", BONE = "#f0ebe5", BG = "#0a0907";
const RAMP = [" ", "·", ":", "-", "=", "+", "*", "#", "▒", "▓", "█"], N = RAMP.length - 1;
const hash = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };

const geo = JSON.parse(fs.readFileSync(path.join(__dirname, "cuyahoga.geo.json"), "utf8"));
const DOWNTOWN = [-81.694, 41.499];
const CLIPN = 41.605;                                   // clip the Lake Erie jurisdiction spike to a clean shoreline

// Sutherland-Hodgman clip of the ring against the half-plane lat <= CLIPN
function clipTop(ring, clip) {
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const ain = a[1] <= clip, bin = b[1] <= clip;
    if (ain) out.push(a);
    if (ain !== bin) { const t = (clip - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, clip]); }
  }
  return out;
}
const RING = clipTop(geo.ring, CLIPN);

function render({ OUT, W, H, fontPx, CX, CY, THfrac, label = true }) {
  const cv = createCanvas(W, H), ctx = cv.getContext("2d");
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.font = `${fontPx}px "DejaVu Sans Mono"`;
  ctx.textBaseline = "top";
  const cw = Math.ceil(ctx.measureText("█").width);
  const ch = Math.ceil(fontPx * 1.06);
  const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);

  // projection: equirectangular w/ cos(lat); fit clipped county to THfrac*H tall, centroid at (CX,CY)
  const xs = RING.map(p => p[0]), ys = RING.map(p => p[1]);
  const lon0 = Math.min(...xs), lon1 = Math.max(...xs), lat0 = Math.min(...ys), lat1 = Math.max(...ys);
  const midlat = ((lat0 + lat1) / 2) * Math.PI / 180;
  const cenLon = (lon0 + lon1) / 2, cenLat = (lat0 + lat1) / 2;
  const sx = (THfrac * H) / (lat1 - lat0);              // px per degree latitude
  const project = (lon, lat) => [
    CX * W + (lon - cenLon) * Math.cos(midlat) * sx,
    CY * H + (cenLat - lat) * sx,
  ];
  const ringPx = RING.map(p => project(...p));

  // point-in-polygon (ray cast) in pixel space, sampled at each cell centre
  const inside = (px, py) => {
    let v = false;
    for (let i = 0, j = ringPx.length - 1; i < ringPx.length; j = i++) {
      const [xi, yi] = ringPx[i], [xj, yj] = ringPx[j];
      if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) v = !v;
    }
    return v;
  };

  // intensity grid: 1 inside (textured), 0 outside
  const inGrid = new Uint8Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      inGrid[j * cols + i] = inside(i * cw + cw / 2, j * ch + ch / 2) ? 1 : 0;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const isIn = inGrid[j * cols + i];
      // boundary = inside cell adjacent to an outside cell (or canvas edge)
      let edge = false;
      if (isIn) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= cols || nj >= rows || !inGrid[nj * cols + ni]) { edge = true; break; }
      }
      if (isIn) {
        if (edge) { ctx.fillStyle = BONE; ctx.fillText("█", i * cw, j * ch); continue; }
        // confident lit amber field: mostly █▓, occasional darker fleck for texture
        let e = 1 - hash(i, j) * 0.22;
        if (hash(i + 5, j * 2) > 0.86) e -= 0.45;
        e = Math.max(0.5, Math.min(1, e));
        const k = Math.floor(e * N);
        ctx.fillStyle = k >= 8 ? AMBER : DIM;
        ctx.fillText(RAMP[k], i * cw, j * ch);
      } else {
        if ((i * 2 + j) % 7 === 0 && hash(i * 3, j) > 0.6) { ctx.fillStyle = LOW; ctx.fillText("·", i * cw, j * ch); }
      }
    }
  }

  if (label) {
    const lbl = (text, px, py, color, size, sp = 0) => {
      ctx.font = `500 ${size}px "DejaVu Sans Mono"`;
      const w = ctx.measureText(text).width + sp * text.length;
      ctx.fillStyle = BG; ctx.fillRect(px - 6, py - 4, w + 12, size + 8);
      ctx.fillStyle = color;
      if (sp) { let x = px; for (const c of text) { ctx.fillText(c, x, py); x += ctx.measureText(c).width + sp; } }
      else ctx.fillText(text, px, py);
    };
    // downtown marker + label
    const [dx, dy] = project(...DOWNTOWN);
    ctx.font = `${fontPx + 4}px "DejaVu Sans Mono"`;
    ctx.fillStyle = BONE; ctx.fillText("◉", dx - cw / 2, dy - ch / 2);
    lbl("CLEVELAND", dx + cw, dy - ch / 2, BONE, Math.round(fontPx * 0.8));
    // county name, centred under the shape
    const cy2 = project(cenLon, lat0)[1];
    lbl("CUYAHOGA COUNTY", CX * W - ctx.measureText("CUYAHOGA COUNTY").width / 2 - 30, cy2 + ch, AMBER, Math.round(fontPx * 0.95), 3);
    lbl(":: SERVICE AREA · PHASE 1 ::", CX * W - 70, cy2 + ch * 2.4, DIM, Math.round(fontPx * 0.62), 2);
  }

  fs.writeFileSync(path.join(__dirname, OUT), cv.toBuffer("image/png"));
  console.log("wrote", OUT, `${cols}x${rows} cells`);
}

// desktop: county on the LEFT (CX=.30), copy overlays dark right half
render({ OUT: "hero-county-wide.png", W: 1680, H: 1040, fontPx: 17, CX: 0.30, CY: 0.50, THfrac: 0.72 });
// mobile: compact near-square banner (used as an inline <img>); copy flows below it in HTML
render({ OUT: "hero-county.png", W: 900, H: 660, fontPx: 14, CX: 0.50, CY: 0.40, THfrac: 0.70 });
