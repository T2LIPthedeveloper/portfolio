"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitFlapDigitProps {
  char: string;
}

function SplitFlapDigit({ char, compact }: SplitFlapDigitProps & { compact?: boolean }) {
  const [current, setCurrent] = useState(char);
  const [next, setNext] = useState(char);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (char === current) return;
    setNext(char);
    setFlipping(true);
    const timer = setTimeout(() => {
      setCurrent(char);
      setFlipping(false);
    }, 840);
    return () => clearTimeout(timer);
  }, [char, current]);

  return (
    <div className={cn("flip-scene relative", compact ? "h-11 w-7" : "h-14 w-9 md:h-[4.5rem] md:w-11")}>
      <div
        className={cn(
          "flip-digit relative h-full w-full rounded-[3px] border border-[#374151] bg-[#111827] font-mono font-bold text-[#f5f5f4] shadow-[inset_0_-2px_0_rgba(0,0,0,0.55)]",
          compact ? "text-lg" : "text-2xl md:text-3xl",
          flipping && "is-flipping"
        )}
      >
        <div className="absolute inset-x-0 top-0 z-10 h-1/2 overflow-hidden border-b border-black/60 bg-[#1f2937]">
          <div className="flex h-[200%] items-center justify-center">{current}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#111827]">
          <div className="flex h-[200%] items-center justify-center -translate-y-1/2">{current}</div>
        </div>

        {flipping && (
          <>
            <div className="flip-top absolute inset-x-0 top-0 z-20 h-1/2 origin-bottom overflow-hidden border-b border-black/60 bg-[#1f2937]">
              <div className="flex h-[200%] items-center justify-center">{current}</div>
            </div>
            <div className="flip-bottom-flap absolute inset-x-0 bottom-0 z-20 h-1/2 origin-top overflow-hidden bg-[#111827]">
              <div className="flex h-[200%] items-center justify-center -translate-y-1/2">{next}</div>
            </div>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 h-px bg-black/70" />
      </div>
    </div>
  );
}

function useAnimatedNumber(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = value;
    const delta = target - from;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + delta * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

interface SolariBoardProps {
  label: string;
  value: number;
  pad?: number;
  suffix?: string;
  className?: string;
  compact?: boolean;
}

export function SolariBoard({ label, value, pad = 6, suffix, className, compact }: SolariBoardProps) {
  const animated = useAnimatedNumber(value);
  const str = animated.toLocaleString().padStart(pad, " ");

  return (
    <div className={cn(compact ? "space-y-1" : "space-y-2", className)}>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#67e8f9]/80">{label}</p>
      <div className="flex items-end gap-1.5">
        <div className="flex gap-0.5">
          {str.split("").map((char, i) =>
            char === " " || char === "," ? (
              <span
                key={`${label}-${i}`}
                className={cn("font-mono text-[#67e8f9]", compact ? "w-1 text-sm" : "w-1.5 text-xl")}
              >
                {char === "," ? "," : ""}
              </span>
            ) : (
              <SplitFlapDigit key={`${label}-${i}-${char}`} char={char} compact={compact} />
            )
          )}
        </div>
        {suffix && <span className="mb-0.5 font-mono text-[10px] uppercase text-[#78716c]">{suffix}</span>}
      </div>
    </div>
  );
}

export function SolariBoardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 rounded-2xl border border-[#1f2937] bg-[#0b1017]/90 p-5 shadow-[inset_0_1px_0_rgba(103,232,249,0.08)] backdrop-blur sm:grid-cols-2">
      {children}
    </div>
  );
}
