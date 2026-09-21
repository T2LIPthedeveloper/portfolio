import type { Metadata, Viewport } from "next";
import "./fonts/embedded.css";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { PilotModeProvider } from "@/components/travel/PilotModeProvider";

/**
 * Fonts are base64-inlined in ./fonts/embedded.css (see npm run fonts:embed).
 * Safari content blockers can block separate .woff2 fetches (even same-origin);
 * data: URLs inside CSS cannot be blocked that way.
 */

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
    <html lang="en" suppressHydrationWarning>
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
