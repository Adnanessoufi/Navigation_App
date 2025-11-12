import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open, onClose, titleId, children,
}: {
  open: boolean; onClose: () => void; titleId?: string; children: React.ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      aria-labelledby={titleId}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {children}
      </div>
    </div>,
    document.body
  );
}
