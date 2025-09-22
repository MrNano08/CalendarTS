import type { ReactNode } from "react";

export default function Modal({
  open, title, onClose, children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="absolute inset-x-3 sm:inset-x-auto sm:right-8 sm:left-auto top-16 sm:top-20
                   w-auto sm:min-w-[480px] bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200">Cerrar</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
