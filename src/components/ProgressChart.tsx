// src/components/ProgressChart.tsx
// Server-friendly, zero-deps inline SVG line chart.

type Series = number[];

function toPolyline(xs: number[], ys: number[], w: number, h: number, pad = 20) {
  const maxY = Math.max(1, ...ys);
  const minY = 0;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const pts = xs.map((_, i) => {
    const x = pad + (i / (xs.length - 1)) * innerW;
    const ny = (ys[i] - minY) / (maxY - minY); // 0..1
    const y = pad + (1 - ny) * innerH;        // invert for SVG
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return pts.join(" ");
}

export default function ProgressChart() {
  const labels = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const seriesA: Series = [0, 0, 0, 0, 0, 2]; // example series
  const seriesB: Series = [0, 0, 0, 0, 3, 7]; // example series

  const W = 820;
  const H = 360;
  const PAD = 28;

  const maxY = Math.max(1, ...seriesA, ...seriesB);
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((i * maxY) / 4));

  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ margin: 0, marginBottom: 8, fontWeight: 600 }}>Project Progress</h3>

      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          role="img"
          aria-label="Project progress line chart"
        >
          <rect x="0" y="0" width={W} height={H} fill="var(--bg-2)" rx="14" />

          <rect
            x={PAD}
            y={PAD}
            width={W - PAD * 2}
            height={H - PAD * 2}
            fill="var(--card)"
            stroke="var(--border)"
            rx="12"
          />

          {ticks.map((t, i) => {
            const y = PAD + (1 - t / maxY) * (H - PAD * 2);
            return (
              <g key={i}>
                <line
                  x1={PAD}
                  y1={y}
                  x2={W - PAD}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />
                <text x={PAD - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                  {t}
                </text>
              </g>
            );
          })}

          {labels.map((m, i) => {
            const x = PAD + (i / (labels.length - 1)) * (W - PAD * 2);
            return (
              <text key={m} x={x} y={H - PAD + 18} textAnchor="middle" fontSize="12" fill="var(--muted)">
                {m}
              </text>
            );
          })}

          <polyline
            fill="none"
            stroke="hsl(140 65% 45%)"
            strokeWidth="3"
            points={toPolyline(labels.map((_, i) => i), seriesA, W, H, PAD)}
          />
          <polyline
            fill="none"
            stroke="hsl(var(--brand-h) var(--brand-s) 54%)"
            strokeWidth="3"
            points={toPolyline(labels.map((_, i) => i), seriesB, W, H, PAD)}
          />
        </svg>
      </div>
    </div>
  );
}