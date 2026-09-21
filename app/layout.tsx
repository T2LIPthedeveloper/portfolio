import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { PilotModeProvider } from "@/components/travel/PilotModeProvider";

/**
 * Self-hosted variable fonts (no unicode-range subsetting).
 * next/font/google was emitting latin faces that fell back to Times/Arial on
 * mobile Safari for display headings — body sans looked fine because Arial is
 * close to Space Grotesk, but Fraunces → Times New Roman looked broken.
 */
const display = localFont({
  src: "./fonts/fraunces-variable.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "100 900",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

const sans = localFont({
  src: "./fonts/space-grotesk-variable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "300 700",
  fallback: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: "Arial",
});

const mono = localFont({
  src: [
    { path: "./fonts/space-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Atul Parida | Portfolio",
  description: "Portfolio website of Atul Parida showcasing projects, work, and travel.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PilotModeProvider>
            <CustomCursor />
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </PilotModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
