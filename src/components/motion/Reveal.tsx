import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

export default function Reveal({
  children,
  delay = 0,
  className,
  y = 20,
}: Props) {
  return (
    <div
      className={`reveal-entry ${className ?? ""}`}
      style={
        { animationDelay: `${delay}s`, "--reveal-y": `${y}px` } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
