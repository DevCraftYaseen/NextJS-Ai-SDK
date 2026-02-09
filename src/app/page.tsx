import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-20">
      <div className="animate-fade-in-up flex w-full max-w-xl flex-col items-center gap-10 text-center">
        {/* Logo mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            How can I help you today?
          </h1>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-text-secondary">
            Intelligent AI completions powered by Gemini. Choose a mode to get started.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Link
            href="/ui/completion"
            className="group rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-text-primary">Completion</h3>
            <p className="text-sm leading-relaxed text-text-tertiary">
              Get instant AI-generated responses with a single request.
            </p>
          </Link>

          <Link
            href="/ui/stream"
            className="group rounded-xl border border-border bg-surface-raised p-5 text-left transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h16M4 6h16M4 18h16"/>
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-text-primary">Stream</h3>
            <p className="text-sm leading-relaxed text-text-tertiary">
              Watch AI responses flow in real-time with smooth streaming.
            </p>
          </Link>
        </div>

        {/* Subtle footer */}
        <p className="animate-fade-in text-xs text-text-tertiary" style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}>
          Powered by Gemini &middot; Built with Next.js &amp; Vercel AI SDK
        </p>
      </div>
    </div>
  );
}
