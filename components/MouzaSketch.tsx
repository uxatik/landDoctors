// A faint mouza-map drawing: irregular plots with dag (plot) numbers, the document every
// land question in Bangladesh comes back to. Decorative only.
export function MouzaSketch({ className }: { className?: string }) {
  const plots = [
    { d: "M8 14 L92 6 L104 70 L20 82 Z", n: "১২৪", x: 52, y: 46 },
    { d: "M104 70 L92 6 L176 18 L170 88 Z", n: "১২৫", x: 136, y: 50 },
    { d: "M20 82 L104 70 L112 150 L14 158 Z", n: "১৩১", x: 62, y: 118 },
    { d: "M104 70 L170 88 L196 164 L112 150 Z", n: "১৩২", x: 148, y: 126 },
    { d: "M176 18 L236 30 L230 120 L170 88 Z", n: "১২৬", x: 204, y: 66 },
    { d: "M170 88 L230 120 L236 176 L196 164 Z", n: "১৩৩", x: 210, y: 146 },
  ];
  return (
    <svg className={className} viewBox="0 0 244 184" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {plots.map((p) => (
          <path key={p.n} d={p.d} />
        ))}
      </g>
      <g fill="currentColor" fontSize="11" textAnchor="middle" fontFamily="var(--font-body)">
        {plots.map((p) => (
          <text key={p.n} x={p.x} y={p.y}>
            {p.n}
          </text>
        ))}
      </g>
    </svg>
  );
}
