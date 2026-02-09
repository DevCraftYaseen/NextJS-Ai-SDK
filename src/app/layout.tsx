import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Intelligent AI completions and streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent transition-transform duration-300 group-hover:scale-105">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg font-semibold text-text-primary">
                Assistant
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/ui/completion"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface hover:text-text-primary"
              >
                Completion
              </Link>
              <Link
                href="/ui/stream"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface hover:text-text-primary"
              >
                Stream
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
