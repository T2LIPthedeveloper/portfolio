"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeLogoProps {
  logo: string;
  logoLight?: string;
  alt: string;
  className?: string;
  size?: number;
}

export function ThemeLogo({ logo, logoLight, alt, className, size = 40 }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const src = isDark ? logo : (logoLight ?? logo);
  const needsDarkPill = !isDark && !logoLight;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl transition-colors duration-300",
        needsDarkPill ? "bg-[#1a1a2e] p-2" : "bg-surface-muted p-2",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain transition-opacity duration-300"
      />
    </div>
  );
}
