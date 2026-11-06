export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <path d="M2 25c4-8 7-11 10-11s5 4 8 4 5-4 10-6v13H2z" fill="#6e4fd8" />
        <path d="M2 27c5-4 9-6 13-6s8 3 15 2v4H2z" fill={light ? "#dce7e1" : "#1c2b2d"} />
      </svg>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-basalt"}`}>
        Imisozi<span className="font-medium opacity-60"> Homes</span>
      </span>
    </span>
  );
}
