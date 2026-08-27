"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CursorMode = "default" | "link" | "button" | "scroll" | "zoom" | "text";

interface MeltTarget {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
}

const COMPACT =
  "a[href], button, [role='button'], input[type='button'], input[type='submit'], label, summary, [data-cursor='button'], [data-cursor='link']";

const TEXTABLE =
  "textarea, input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']):not([type='hidden'])";

/** Melt only into small controls — never full-page cards. */
const MELT_MAX_WIDTH = 240;
const MELT_MAX_HEIGHT = 72;

function canMelt(rect: DOMRect) {
  return rect.width <= MELT_MAX_WIDTH && rect.height <= MELT_MAX_HEIGHT && rect.width >= 8 && rect.height >= 8;
}

function resolveMode(el: Element | null, scrolling: boolean, pressed: boolean): CursorMode {
  if (!el) return "default";

  if (el.closest(TEXTABLE)) return "text";

  if (el.closest("[data-cursor='zoom']")) {
    if (pressed) return "default";
    return "zoom";
  }

  if (el.closest("[data-cursor='scroll']")) {
    if (pressed) return "default";
    return "scroll";
  }

  if (scrolling) return "scroll";

  const compact = el.closest(COMPACT) as HTMLElement | null;
  if (compact && canMelt(compact.getBoundingClientRect())) {
    if (compact.matches("a[href], [data-cursor='link']") || compact.closest("a[href]")) return "link";
    return "button";
  }

  return "default";
}

function resolveHost(el: Element | null, mode: CursorMode): HTMLElement | null {
  if (!el || mode === "text" || mode === "scroll" || mode === "zoom" || mode === "default") return null;
  const compact = el.closest(COMPACT) as HTMLElement | null;
  if (compact && canMelt(compact.getBoundingClientRect())) return compact;
  return null;
}

function readRadius(host: HTMLElement, rect: DOMRect) {
  const styles = window.getComputedStyle(host);
  const radiusToken = styles.borderRadius.split(" ")[0] ?? "0";
  let radius = Number.parseFloat(radiusToken);
  if (radiusToken.endsWith("%")) {
    radius = (Math.min(rect.width, rect.height) * radius) / 100;
  }
  if (!Number.isFinite(radius)) radius = 999;
  const pill =
    styles.borderRadius.includes("999") ||
    radius >= Math.min(rect.width, rect.height) / 2 - 0.5;
  return pill ? Math.min(rect.width, rect.height) / 2 : radius;
}

function readMelt(host: HTMLElement | null): MeltTarget | null {
  if (!host || !host.isConnected) return null;
  const rect = host.getBoundingClientRect();
  if (!canMelt(rect)) return null;
  if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
    return null;
  }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    w: rect.width,
    h: rect.height,
    radius: readRadius(host, rect),
  };
}

function snapRing(
  m: { x: number; y: number; w: number; h: number; radius: number; opacity: number },
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  m.x = x;
  m.y = y;
  m.w = w;
  m.h = h;
  m.radius = radius;
  m.opacity = 0.9;
}

/**
 * Minimal cursor: melt on compact controls, scroll lists, zoom on globe,
 * tiny plane badge in Pilot Mode. Size snaps — no intermediate blob.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [melting, setMelting] = useState(false);
  const [pilot, setPilot] = useState(false);
  const [zoomDir, setZoomDir] = useState<"in" | "out" | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const meltRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);

  const pointer = useRef({ x: 0, y: 0 });
  const display = useRef({ x: 0, y: 0 });
  const hostRef = useRef<HTMLElement | null>(null);
  const melt = useRef<MeltTarget | null>(null);
  const meltDisplay = useRef({ x: 0, y: 0, w: 12, h: 12, radius: 999, opacity: 0.85 });
  const stretch = useRef(1);
  const zoomPulse = useRef(1);
  const pressed = useRef(false);
  const scrolling = useRef(false);
  const scrollIdle = useRef<number | null>(null);
  const zoomIdle = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const modeRef = useRef<CursorMode>("default");
  const snapNext = useRef(false);
  const pilotRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(media.matches && !reduceMotion.matches);
    sync();
    media.addEventListener("change", sync);
    reduceMotion.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      reduceMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor");

    const syncPilot = () => {
      const active = document.documentElement.classList.contains("pilot-mode");
      pilotRef.current = active;
      setPilot(active);
    };
    syncPilot();
    const observer = new MutationObserver(syncPilot);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const applyMode = (next: CursorMode) => {
      if (next === modeRef.current) return;
      const leavingMelt = Boolean(melt.current) && next !== "link" && next !== "button";
      if (leavingMelt || next === "scroll" || next === "zoom") snapNext.current = true;
      modeRef.current = next;
      setMode(next);
    };

    const syncFromElement = (el: Element | null) => {
      const nextMode = resolveMode(el, scrolling.current, pressed.current);
      const host = resolveHost(el, nextMode);
      const nextMelt = host ? readMelt(host) : null;

      if (melt.current && !nextMelt) snapNext.current = true;
      if (nextMelt && host !== hostRef.current) {
        snapRing(
          meltDisplay.current,
          nextMelt.x,
          nextMelt.y,
          nextMelt.w,
          nextMelt.h,
          nextMelt.radius
        );
      }

      hostRef.current = host;
      melt.current = nextMelt;
      applyMode(nextMode);
      setMelting(Boolean(nextMelt));
    };

    const resyncUnderPointer = () => {
      syncFromElement(document.elementFromPoint(pointer.current.x, pointer.current.y));
    };

    const beginScroll = (inScrollZone: boolean) => {
      scrolling.current = true;
      hostRef.current = null;
      melt.current = null;
      setMelting(false);
      snapNext.current = true;
      applyMode("scroll");
      if (scrollIdle.current != null) window.clearTimeout(scrollIdle.current);
      scrollIdle.current = window.setTimeout(() => {
        scrolling.current = false;
        resyncUnderPointer();
      }, inScrollZone ? 80 : 140);
    };

    const tick = () => {
      const md = modeRef.current;

      if (md === "scroll" || md === "zoom") {
        hostRef.current = null;
        melt.current = null;
      } else if (hostRef.current) {
        const live = readMelt(hostRef.current);
        melt.current = live;
        if (!live) {
          hostRef.current = null;
          setMelting(false);
          snapNext.current = true;
        }
      }

      const isMelt = Boolean(melt.current) && (md === "link" || md === "button");
      display.current.x += (pointer.current.x - display.current.x) * 0.45;
      display.current.y += (pointer.current.y - display.current.y) * 0.45;
      stretch.current += (1 - stretch.current) * 0.2;
      zoomPulse.current += (1 - zoomPulse.current) * 0.12;

      const m = meltDisplay.current;
      const px = display.current.x;
      const py = display.current.y;

      if (isMelt && melt.current) {
        const t = melt.current;
        const k = snapNext.current ? 1 : 0.35;
        m.x += (t.x - m.x) * k;
        m.y += (t.y - m.y) * k;
        m.w += (t.w - m.w) * k;
        m.h += (t.h - m.h) * k;
        m.radius += (t.radius - m.radius) * k;
        m.opacity += (0.95 - m.opacity) * 0.3;
      } else if (md === "zoom") {
        const size = 18 * zoomPulse.current;
        if (snapNext.current) snapRing(m, px, py, size, size, 999);
        else {
          m.x += (px - m.x) * 0.5;
          m.y += (py - m.y) * 0.5;
          m.w += (size - m.w) * 0.35;
          m.h += (size - m.h) * 0.35;
          m.radius += (999 - m.radius) * 0.4;
          m.opacity += (0.9 - m.opacity) * 0.3;
        }
      } else if (md === "scroll") {
        const w = 9;
        const h = 20 * stretch.current;
        if (snapNext.current) {
          snapRing(m, px, py, w, h, 999);
        } else {
          m.x += (px - m.x) * 0.45;
          m.y += (py - m.y) * 0.45;
          m.w += (w - m.w) * 0.35;
          m.h += (h - m.h) * 0.35;
          m.radius += (999 - m.radius) * 0.4;
          m.opacity += (0.92 - m.opacity) * 0.3;
        }
      } else if (md === "text") {
        if (snapNext.current) snapRing(m, px, py, 2, 18, 1);
        else {
          m.x += (px - m.x) * 0.5;
          m.y += (py - m.y) * 0.5;
          m.w += (2 - m.w) * 0.4;
          m.h += (18 - m.h) * 0.4;
          m.radius += (1 - m.radius) * 0.4;
          m.opacity += (0.95 - m.opacity) * 0.3;
        }
      } else {
        // Default: soft ring. In Pilot Mode the plane is the cursor (not a side badge).
        const idle = pressed.current
          ? pilotRef.current
            ? 10
            : 8
          : pilotRef.current
            ? 16
            : 12;
        if (snapNext.current) snapRing(m, px, py, idle, idle, 999);
        else {
          m.x += (px - m.x) * 0.48;
          m.y += (py - m.y) * 0.48;
          m.w += (idle - m.w) * 0.4;
          m.h += (idle - m.h) * 0.4;
          m.radius += (999 - m.radius) * 0.4;
          m.opacity += ((pilotRef.current ? 0.55 : 0.88) - m.opacity) * 0.3;
        }
      }

      snapNext.current = false;

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      }
      if (meltRef.current) {
        const radius = Math.min(m.radius, Math.min(m.w, m.h) / 2);
        meltRef.current.style.width = `${m.w}px`;
        meltRef.current.style.height = `${m.h}px`;
        meltRef.current.style.opacity = String(m.opacity);
        meltRef.current.style.borderRadius = `${radius}px`;
        meltRef.current.style.transform = `translate3d(${m.x - px}px, ${m.y - py}px, 0) translate(-50%, -50%) scale(${pressed.current && isMelt ? 0.96 : 1})`;
      }

      const showPlane = pilotRef.current && md === "default" && !isMelt;
      const showScroll = md === "scroll" && !pressed.current;
      const showZoom = md === "zoom" && !pressed.current;

      if (dotRef.current) {
        // Plane replaces the default dot in Pilot Mode
        const hide = isMelt || md === "text" || md === "scroll" || md === "zoom" || showPlane;
        dotRef.current.style.opacity = hide ? "0" : "1";
        dotRef.current.style.transform = `translate(-50%, -50%) scale(${pressed.current ? 0.55 : 1})`;
      }
      if (glyphRef.current) {
        const show = showScroll || showZoom || showPlane;
        glyphRef.current.style.opacity = show ? (showPlane ? "0.9" : "0.75") : "0";
        glyphRef.current.style.transform = showPlane
          ? `translate(-50%, -50%) scale(${pressed.current ? 0.62 : 1})`
          : "translate(-50%, -50%) scale(1)";
      }

      raf.current = window.requestAnimationFrame(tick);
    };

    raf.current = window.requestAnimationFrame(tick);

    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
      if (!scrolling.current) syncFromElement(event.target as Element | null);
    };

    const onLeave = () => {
      setVisible(false);
      hostRef.current = null;
      melt.current = null;
      applyMode("default");
      setMelting(false);
      snapNext.current = true;
    };

    const onDown = (event: PointerEvent) => {
      pressed.current = true;
      syncFromElement(event.target as Element | null);
    };
    const onUp = (event: PointerEvent) => {
      pressed.current = false;
      syncFromElement(event.target as Element | null);
    };

    const onWheel = (event: WheelEvent) => {
      const target = event.target as Element | null;
      const overZoom = Boolean(target?.closest("[data-cursor='zoom']"));
      if (overZoom) {
        // Pulse ring: larger = zooming out feel, smaller = zooming in — direction-agnostic cue
        const outward = event.deltaY > 0;
        zoomPulse.current = Math.min(1.55, Math.max(0.7, outward ? 1.35 : 0.78));
        setZoomDir(outward ? "out" : "in");
        if (zoomIdle.current != null) window.clearTimeout(zoomIdle.current);
        zoomIdle.current = window.setTimeout(() => setZoomDir(null), 220);
        applyMode("zoom");
        snapNext.current = true;
        return;
      }

      const inScrollZone = Boolean(target?.closest("[data-cursor='scroll']"));
      stretch.current = Math.min(1.7, 1 + Math.abs(event.deltaY) / 48);
      beginScroll(inScrollZone);
    };

    const onScroll = (event: Event) => {
      const node = event.target;
      if (!(node instanceof Element)) return;
      if (node.closest("[data-cursor='zoom']")) return;
      const inScrollZone = Boolean(node.closest("[data-cursor='scroll']"));
      beginScroll(inScrollZone);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      observer.disconnect();
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
      if (scrollIdle.current != null) window.clearTimeout(scrollIdle.current);
      if (zoomIdle.current != null) window.clearTimeout(zoomIdle.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll, true);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[100] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        ref={meltRef}
        className={cn(
          "cursor-melt absolute left-0 top-0",
          melting && "cursor-melt--full",
          !melting && mode === "scroll" && "cursor-melt--scroll",
          !melting && mode === "zoom" && "cursor-melt--zoom",
          !melting && mode === "text" && "cursor-melt--text",
          !melting && mode === "default" && "cursor-melt--idle"
        )}
        style={{ width: 12, height: 12, borderRadius: 999, opacity: 0.85 }}
      />

      <div
        ref={dotRef}
        className="cursor-dot absolute left-0 top-0 h-1.5 w-1.5 rounded-full"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      <div
        ref={glyphRef}
        className="cursor-glyph absolute left-0 top-0 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-100"
        style={{ opacity: 0 }}
      >
        {mode === "scroll" && (
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden>
            <path
              d="M4 1.2 L4 11.8 M2.2 3.1 L4 1.2 L5.8 3.1 M2.2 9.9 L4 11.8 L5.8 9.9"
              stroke="currentColor"
              strokeWidth="1.05"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {mode === "zoom" && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="5.5" cy="5.5" r="3.2" stroke="currentColor" strokeWidth="1.1" />
            <path d="M8 8 L10.4 10.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            {zoomDir === "in" && (
              <path d="M5.5 4 V7 M4 5.5 H7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            )}
            {zoomDir === "out" && (
              <path d="M4 5.5 H7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            )}
            {!zoomDir && (
              <path d="M5.5 4 V7 M4 5.5 H7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
            )}
          </svg>
        )}
        {pilot && mode === "default" && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
