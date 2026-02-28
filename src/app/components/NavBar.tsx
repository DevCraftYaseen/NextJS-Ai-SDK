"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation groups for dropdown organization
const navGroups = [
  {
    label: "Text AI",
    href: "/ui/chat",
    items: [
      { href: "/ui/completion", label: "Completion", desc: "Single AI response" },
      { href: "/ui/stream", label: "Stream", desc: "Real-time streaming" },
      { href: "/ui/chat", label: "Chat", desc: "Multi-turn conversation" },
      { href: "/ui/tools", label: "Tools", desc: "AI with tool calling" },
      { href: "/ui/multi-step-tool", label: "Multi-Step", desc: "Chained tool execution" },
      { href: "/ui/weather-api", label: "Weather", desc: "Real-time weather lookup" },
      { href: "/ui/web-search-tool", label: "Web Search", desc: "Google search with AI" },
      { href: "/ui/mcp-tools", label: "MCP Tools", desc: "Model Context Protocol tools" },
    ],
  },
  {
    label: "Vision",
    href: "/ui/multi-modal-chat",
    items: [
      { href: "/ui/multi-modal-chat", label: "Vision Chat", desc: "Image + text input" },
      { href: "/ui/generate-image", label: "Image Gen", desc: "AI image generation" },
      { href: "/ui/gen-img-tool", label: "Image Gen Tool", desc: "Tool-based image generation" },
    ],
  },
  {
    label: "Structured",
    href: "/ui/structured-data",
    items: [
      { href: "/ui/structured-data", label: "Recipes", desc: "Object output" },
      { href: "/ui/structured-array", label: "Pokémon", desc: "Array output" },
      { href: "/ui/structured-enums", label: "Sentiment", desc: "Enum classification" },
    ],
  },
  {
    label: "Audio",
    href: "/ui/transcribe-audio",
    items: [
      { href: "/ui/transcribe-audio", label: "Transcribe", desc: "Speech to text" },
      { href: "/ui/tts", label: "Text to Speech", desc: "Convert text to audio" },
    ],
  },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setOpenDropdown(null));

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (group: (typeof navGroups)[0]) =>
    group.items.some((item) => isActive(item.href));

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-mono text-lg font-bold text-accent">
            {"{"}DCY{"}"}
          </span>
          <span className="hidden text-lg font-semibold text-text-primary sm:block">
            Assistant
          </span>
        </Link>

        {/* Desktop Navigation - Grouped Dropdowns */}
        <div ref={dropdownRef} className="hidden items-center gap-1 md:flex">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === group.label ? null : group.label)
                }
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isGroupActive(group) || openDropdown === group.label
                    ? "bg-surface text-text-primary"
                    : "text-text-secondary hover:bg-surface/50 hover:text-text-primary"
                }`}
              >
                {group.label}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${
                    openDropdown === group.label ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openDropdown === group.label && (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface-raised p-1.5 shadow-lg animate-fade-in">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex flex-col rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                        isActive(item.href)
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-surface hover:text-text-primary"
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs opacity-70">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-surface hover:text-text-primary md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden border-b border-border bg-surface transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen ? "max-h-[32rem]" : "max-h-0 border-b-0"
        }`}
      >
        <div className="space-y-1 px-4 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                      isActive(item.href)
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-60">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="mb-3">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Links
            </div>
            <div className="space-y-0.5">
              <Link href="/ui/weather-api" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Weather
              </Link>
              <Link href="/ui/web-search-tool" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Web Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
