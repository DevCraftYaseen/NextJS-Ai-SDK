"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// All navigation links — single source of truth for both desktop and mobile menus.
const navLinks = [
  { href: "/ui/completion", label: "Completion" },
  { href: "/ui/stream", label: "Stream" },
  { href: "/ui/chat", label: "Chat" },
  { href: "/ui/multi-modal-chat", label: "Vision" },
  { href: "/ui/structured-data", label: "Recipes" },
  { href: "/ui/structured-array", label: "Pokémon" },
  { href: "/ui/structured-enums", label: "Sentiment" },
  { href: "/ui/generate-image", label: "Image Gen" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="shrink-0 z-50 relative border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
          <span className="font-mono text-lg font-bold text-accent transition-transform duration-300 group-hover:scale-105">
            {"{"}DCY{"}"}
          </span>
          <span className="text-lg font-semibold text-text-primary">
            Assistant
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-surface hover:text-text-primary ${
                pathname === link.href
                  ? "bg-surface text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button — visible only on mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-surface hover:text-text-primary"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            /* X icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu — overlays content, doesn't push it down */}
      <div
        className={`md:hidden absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-border bg-background/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[28rem] border-t border-border-light" : "max-h-0 border-b-0"
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-surface hover:text-text-primary ${
                pathname === link.href
                  ? "bg-surface text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
