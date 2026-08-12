import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dotRef.current) return;
      dotRef.current.style.left = `${e.clientX}px`;
      dotRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "var(--color-terracotta)",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        zIndex: 999,
        opacity: 0.6,
        transition: "opacity 0.2s ease",
        display: window.matchMedia("(pointer: fine)").matches ? "block" : "none",
      }}
    />
  );
}
