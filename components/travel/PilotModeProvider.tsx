"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface PilotModeContextValue {
  isPilotMode: boolean;
  enterPilot: () => void;
  exitPilot: () => void;
  togglePilot: () => void;
}

const PilotModeContext = createContext<PilotModeContextValue | null>(null);

export function PilotModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isPilotMode, setIsPilotMode] = useState(false);
  const savedThemeRef = useRef<string>("system");

  const applyPilotClass = useCallback((active: boolean) => {
    document.documentElement.classList.toggle("pilot-mode", active);
  }, []);

  const exitPilot = useCallback(() => {
    setIsPilotMode(false);
    applyPilotClass(false);
    setTheme(savedThemeRef.current);
  }, [applyPilotClass, setTheme]);

  const enterPilot = useCallback(() => {
    savedThemeRef.current = theme ?? "system";
    setIsPilotMode(true);
    applyPilotClass(true);
    setTheme("dark");
  }, [applyPilotClass, setTheme, theme]);

  const togglePilot = useCallback(() => {
    if (isPilotMode) exitPilot();
    else enterPilot();
  }, [enterPilot, exitPilot, isPilotMode]);

  useEffect(() => {
    if (pathname !== "/travel" && isPilotMode) {
      exitPilot();
    }
  }, [pathname, isPilotMode, exitPilot]);

  useEffect(() => {
    return () => applyPilotClass(false);
  }, [applyPilotClass]);

  return (
    <PilotModeContext.Provider value={{ isPilotMode, enterPilot, exitPilot, togglePilot }}>
      {children}
    </PilotModeContext.Provider>
  );
}

export function usePilotMode() {
  const ctx = useContext(PilotModeContext);
  if (!ctx) {
    throw new Error("usePilotMode must be used within PilotModeProvider");
  }
  return ctx;
}

export function usePilotModeOptional() {
  return useContext(PilotModeContext);
}
