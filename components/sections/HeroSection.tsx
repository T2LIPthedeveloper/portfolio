"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Typewriter from "typewriter-effect";

interface HeroSectionProps {
  name: string;
  headline: string;
  photoSrc?: string;
}

const PHOTO_SIZE = "h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52";

const TYPEWRITER_LINES = [
  "I'm a Software Engineer.",
  "I'm a Data Scientist.",
  "I'm an AI/ML Enthusiast.",
];

export function HeroSection({ name, photoSrc = "/images/atul.jpg" }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-6 md:py-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex flex-row items-center gap-5 sm:gap-8 md:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 flex-1"
        >
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-text-muted">Portfolio</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            {name}
          </h1>
          <div className="mt-3 min-h-[2.25rem] text-lg text-text-secondary sm:text-xl md:text-2xl">
            <Typewriter
              options={{
                strings: TYPEWRITER_LINES,
                autoStart: true,
                loop: true,
                delay: 40,
                deleteSpeed: 24,
              }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-base font-medium text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              View my work
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/travel"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-base font-medium text-text-primary transition-all duration-200 hover:bg-surface-muted active:scale-[0.98]"
            >
              Where I&apos;ve been
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className={`relative ${PHOTO_SIZE} shrink-0`}
        >
          <div
            className={`relative ${PHOTO_SIZE} overflow-hidden rounded-full border-2 border-border`}
          >
            <Image src={photoSrc} alt={name} fill className="object-cover" priority sizes="208px" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
