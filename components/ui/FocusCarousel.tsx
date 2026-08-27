"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FocusCarouselProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number, isFocused: boolean) => React.ReactNode;
  className?: string;
}

/** Slot + spacer share of scrollport height — keeps prev/next cards visible while snapped. */
const SLOT_RATIO = 0.42;
const SPACER_RATIO = (1 - SLOT_RATIO) / 2;

export function FocusCarousel<T>({
  items,
  getKey,
  renderItem,
  className,
}: FocusCarouselProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didInitialAlign = useRef(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [portHeight, setPortHeight] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () => setPortHeight(scroller.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const updateFocus = useCallback(() => {
    if (!didInitialAlign.current) return;

    const scroller = scrollerRef.current;
    if (!scroller || items.length === 0) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const viewportCenter = scrollerRect.top + scrollerRect.height / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((element, index) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setFocusedIndex(closestIndex);
  }, [items.length]);

  // After layout heights are known, snap the first (most recent) card to center once.
  useEffect(() => {
    if (portHeight <= 0 || items.length === 0) return;

    const scroller = scrollerRef.current;
    const first = itemRefs.current[0];
    if (!scroller || !first) return;

    didInitialAlign.current = false;
    setFocusedIndex(0);

    const frame = requestAnimationFrame(() => {
      first.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      didInitialAlign.current = true;
      setFocusedIndex(0);
    });

    return () => cancelAnimationFrame(frame);
  }, [portHeight, items.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.addEventListener("scroll", updateFocus, { passive: true });
    return () => scroller.removeEventListener("scroll", updateFocus);
  }, [updateFocus]);

  const scrollToIndex = useCallback((index: number) => {
    itemRefs.current[index]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  const slotHeight = portHeight > 0 ? portHeight * SLOT_RATIO : undefined;
  const spacerHeight = portHeight > 0 ? portHeight * SPACER_RATIO : undefined;

  return (
    <div
      ref={scrollerRef}
      data-cursor="scroll"
      className={cn(
        "h-full min-h-0 touch-pan-y overflow-y-auto overscroll-y-contain snap-y snap-mandatory no-scrollbar",
        className
      )}
    >
      <div className="shrink-0 snap-none" style={{ height: spacerHeight }} aria-hidden />

      {items.map((item, index) => {
        const dist = Math.abs(index - focusedIndex);
        const isFocused = index === focusedIndex;
        const scale = isFocused ? 1 : Math.max(0.84, 1 - dist * 0.06);
        const opacity = isFocused ? 1 : Math.max(0.38, 1 - dist * 0.26);
        const blur = isFocused ? 0 : Math.min(4, dist * 1.75);

        return (
          <div
            key={getKey(item, index)}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            className="flex shrink-0 snap-center snap-always items-center justify-center px-1"
            style={{ height: slotHeight }}
          >
            <motion.div
              animate={{
                scale,
                opacity,
                filter: `blur(${blur}px)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className={cn(
                "w-full will-change-transform",
                isFocused ? "z-20 max-w-2xl" : "z-10 max-w-lg"
              )}
            >
              {isFocused ? (
                renderItem(item, index, true)
              ) : (
                <button
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className="block w-full appearance-none border-0 bg-transparent p-0 text-left"
                  aria-label={`Show ${index + 1} of ${items.length}`}
                >
                  {renderItem(item, index, false)}
                </button>
              )}
            </motion.div>
          </div>
        );
      })}

      <div className="shrink-0 snap-none" style={{ height: spacerHeight }} aria-hidden />
    </div>
  );
}
