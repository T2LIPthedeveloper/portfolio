"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePilotModeOptional } from "@/components/travel/PilotModeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const pilot = usePilotModeOptional();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isPilotMode = pilot?.isPilotMode ?? false;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "dark" ? (
      <Sun className="h-4 w-4" />
    ) : theme === "system" ? (
      <Monitor className="h-4 w-4" />
    ) : (
      <Moon className="h-4 w-4" />
    );

  return (
    <button
      type="button"
      aria-label={isPilotMode ? "Exit Pilot Mode to change theme" : "Cycle theme"}
      title={isPilotMode ? "Exit Pilot Mode to change theme" : "Cycle theme: light, dark, system"}
      disabled={isPilotMode}
      onClick={cycleTheme}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:text-accent",
        isPilotMode && "cursor-not-allowed opacity-40 hover:text-text-secondary",
        className
      )}
      style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)" }}
    >
      {mounted ? icon : <span className="h-4 w-4" />}
    </button>
  );
}
