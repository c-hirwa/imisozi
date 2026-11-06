/** Topographic contour lines: Kigali's hills, drawn as the site's recurring motif. */
export function Contours({ className = "", stroke = "currentColor" }: { className?: string; stroke?: string }) {
  const rings = (cx: number, cy: number, n: number, r0: number, seed: number) =>
    Array.from({ length: n }, (_, k) => {
      const r = r0 + k * 26;
      const pts = Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const wob = 1 + 0.12 * Math.sin(a * 3 + seed + k * 0.35) + 0.07 * Math.sin(a * 5 - seed * 2 + k * 0.2);
        return [cx + Math.cos(a) * r * 1.35 * wob, cy + Math.sin(a) * r * wob];
      });
      return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
    });
  const paths = [...rings(260, 330, 9, 30, 1), ...rings(900, 180, 11, 24, 4), ...rings(1350, 560, 8, 40, 2.5)];
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        {paths.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}
