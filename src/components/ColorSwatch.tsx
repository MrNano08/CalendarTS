// ColorSwatch.tsx
import { useRef } from "react";

export default function ColorSwatch({
  value, onChange, size = 32, title = "Elegir color",
}: {
  value: string;
  onChange: (hex: string) => void;
  size?: number;
  title?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={() => inputRef.current?.click()}
      className="rounded-xl shadow-sm ring-1 ring-black/5 hover:ring-black/10 shrink-0"
      style={{ width: size, height: size, background: value }}
    >
      <input
        ref={inputRef}
        type="color"
        className="hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </button>
  );
}
