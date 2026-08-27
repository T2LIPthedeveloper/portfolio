"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/travel", label: "Travel" },
  { href: "/about", label: "About" },
  { href: "/chat", label: "Chat" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Soft veil so page content doesn't collide with the floating nav */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-canvas) 0%, color-mix(in srgb, var(--color-canvas) 85%, transparent) 55%, transparent 100%)",
        }}
        aria-hidden
      />

      <motion.header
        initial={false}
        animate={{
          width: scrolled ? "min(720px, calc(100vw - 1.5rem))" : "min(1100px, calc(100vw - 1.5rem))",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-50 -translate-x-1/2"
      >
        <nav className="glass flex items-center justify-between gap-2 rounded-full px-3 py-2 shadow-lg sm:gap-3 md:gap-4 md:px-6">
          <Link href="/" className="font-display text-lg font-semibold text-text-primary">
            AP
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="hidden lg:flex" />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {open && (
        <div
          className="fixed inset-0 z-[60] px-6 backdrop-blur-xl lg:hidden"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-canvas) 95%, transparent)",
            paddingTop: "max(5rem, env(safe-area-inset-top))",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "min-h-11 px-4 py-2 font-display text-2xl sm:text-3xl",
                  pathname === link.href ? "text-accent" : "text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}
