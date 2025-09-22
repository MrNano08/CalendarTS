export default function IconBtn({
    title, onClick, disabled, direction,
  }: { title: string; onClick: () => void; disabled?: boolean; direction: "left" | "right" }) {
    return (
      <button
        aria-label={title}
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-sm ring-1 ring-slate-200
                   bg-white/70 backdrop-blur hover:bg-white disabled:opacity-40 flex items-center justify-center group"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 24 24"
             className={`w-4 h-4 text-slate-700 ${direction === "right" ? "rotate-180" : ""}`}>
          <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }
  