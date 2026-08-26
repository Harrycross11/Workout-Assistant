// ============================================================
// A tiny dependency-free line chart - just enough for "value over time"
// (body weight, exercise weight). Not a general charting library, just the
// one shape this app actually needs, so it doesn't pull in an external
// dependency for something this simple.
// ============================================================
function drawLineChart(canvas, points, opts) {
  opts = opts || {};
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const pad = { l: 36, r: 12, t: 12, b: 24 };
  const w = cssW - pad.l - pad.r;
  const h = cssH - pad.t - pad.b;
  const lineColor = opts.color || '#4ade80';
  const textColor = opts.textColor || '#94a3b8';
  const gridColor = opts.gridColor || 'rgba(148,163,184,0.15)';

  if (!points || points.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', cssW / 2, cssH / 2);
    return;
  }

  const values = points.map(p => p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const pad10 = (max - min) * 0.1;
  min -= pad10; max += pad10;

  // Horizontal gridlines + axis labels (4 bands).
  ctx.strokeStyle = gridColor;
  ctx.fillStyle = textColor;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + (h * i) / 3;
    const val = max - ((max - min) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + w, y);
    ctx.stroke();
    ctx.fillText(val.toFixed(1), pad.l - 6, y + 3);
  }

  const xFor = i => pad.l + (points.length > 1 ? (w * i) / (points.length - 1) : w / 2);
  const yFor = v => pad.t + h - ((v - min) / (max - min)) * h;

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xFor(i), y = yFor(p.value);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = lineColor;
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(xFor(i), yFor(p.value), 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // First/last date labels only - a label per point would overlap on
  // anything but a very short history.
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.fillText(points[0].label || '', pad.l, cssH - 6);
  ctx.textAlign = 'right';
  ctx.fillText(points[points.length - 1].label || '', pad.l + w, cssH - 6);
}
