// LandDoctor mark: three mouza plots inside a rounded square, on the Designfoli gradient.
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ld-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-primary-600)" />
          <stop offset="1" stopColor="var(--color-new)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ld-mark)" />
      <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M7 9.5 17 7.5l1.5 8.5L8.5 18Z" />
        <path d="M18.5 16 17 7.5l7.5 2.2-.7 8Z" />
        <path d="M8.5 18 18.5 16l5.3 1.7-.3 6.8L9 25Z" />
      </g>
    </svg>
  );
}
