import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* ─── HERO SECTION ─── */}
      <section className="flex flex-col items-center justify-center px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
        <div className="animate-fade-in-up flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          {/* Profile Photo — place your photo as /public/logo.jpg */}
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-accent/20 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="Yaseen Khan"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Name & Brand */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl md:text-4xl">
              Yaseen Khan
            </h1>
            <p className="text-base text-text-secondary">
              Full Stack Developer &middot;{" "}
              <a
                href="https://www.devcraftyaseen.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover transition-colors duration-200"
              >
                DevCraftYaseen
              </a>
            </p>
          </div>

          {/* App Description */}
          <div className="max-w-md space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-bold text-accent">
                {"{"}DCY{"}"}
              </span>
              <span className="text-xl font-semibold text-text-primary">Assistant</span>
            </div>
            <p className="text-sm leading-relaxed text-text-tertiary">
              An AI-powered assistant showcasing completions, real-time streaming, multi-turn chat, and structured data generation — built with Next.js, Vercel AI SDK &amp; Gemini.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="animate-fade-in mb-5 text-xs font-semibold uppercase tracking-widest text-text-tertiary text-center">
            Explore Features
          </h2>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Completion Card */}
            <Link
              href="/ui/completion"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Completion</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Get instant AI-generated responses with a single request.
              </p>
            </Link>

            {/* Stream Card */}
            <Link
              href="/ui/stream"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16M4 6h16M4 18h16"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Stream</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Watch AI responses flow in real-time with smooth streaming.
              </p>
            </Link>

            {/* Chat Card */}
            <Link
              href="/ui/chat"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Chat</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Multi-turn conversations with full message history and streaming.
              </p>
            </Link>

            {/* Recipes / Structured Data Card */}
            <Link
              href="/ui/structured-data"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Recipes</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Generate structured recipes with ingredients and step-by-step instructions.
              </p>
            </Link>

            {/* Pokémon / Structured Array Card */}
            <Link
              href="/ui/structured-array"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Pokémon</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Stream an array of Pokémon with abilities using structured array output.
              </p>
            </Link>

            {/* Sentiment / Structured Enums Card */}
            <Link
              href="/ui/structured-enums"
              className="group animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
              style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">Sentiment</h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Classify text sentiment as positive, negative, or neutral with enum output.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK BADGE ROW ─── */}
      <section className="px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {["Next.js", "React", "Tailwind CSS", "Vercel AI SDK", "Gemini", "TypeScript", "Zod"].map(
            (tech) => (
              <span
                key={tech}
                className="rounded-full border border-border-light bg-surface px-3 py-1 text-xs font-medium text-text-tertiary"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mt-auto border-t border-border-light bg-surface/50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            {/* Left — branding */}
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-accent">
                  {"{"}DCY{"}"}
                </span>
                <span className="text-sm font-semibold text-text-primary">Assistant</span>
              </div>
              <p className="text-xs text-text-tertiary">
                Built by Yaseen Khan &middot; &copy; {new Date().getFullYear()}
              </p>
            </div>

            {/* Center — page links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Link href="/ui/completion" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Completion
              </Link>
              <Link href="/ui/stream" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Stream
              </Link>
              <Link href="/ui/chat" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Chat
              </Link>
              <Link href="/ui/structured-data" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Recipes
              </Link>
              <Link href="/ui/structured-array" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Pokémon
              </Link>
              <Link href="/ui/structured-enums" className="text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
                Sentiment
              </Link>
            </div>

            {/* Right — social links */}
            <div className="flex items-center gap-3">
              {/* Portfolio Website */}
              <a
                href="https://www.devcraftyaseen.site"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-tertiary transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                title="Portfolio"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
              {/* GitHub */}
              <a
                href="https://github.com/DevCraftYaseen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-tertiary transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                title="GitHub"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com/DevCraftYaseen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-tertiary transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-sm"
                title="Twitter / X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
