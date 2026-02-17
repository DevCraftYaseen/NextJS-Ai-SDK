"use client";

import { useState } from "react";

// Sentiment labels returned by the enum API.
type Sentiment = "positive" | "negative" | "neutral";

// Maps each sentiment to a themed color config for the result badge.
const sentimentConfig: Record<Sentiment, { label: string; color: string; bg: string; border: string; icon: string }> = {
  positive: { label: "Positive", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: "😊" },
  negative: { label: "Negative", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "😞" },
  neutral:  { label: "Neutral",  color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "😐" },
};

function StructuredEnums() {
  const [text, setText] = useState("");
  // Stores the text that was actually submitted — displayed in the result card.
  const [analyzedText, setAnalyzedText] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the user has submitted at least once — switches to results layout.
  const [started, setStarted] = useState(false);

  // Calls /api/structured-enums with the text and reads the enum result.
  // generateObject with output:'enum' returns a plain JSON response.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const submittedText = text.trim();
    setAnalyzedText(submittedText);
    setText("");
    setStarted(true);
    setIsLoading(true);
    setError(null);
    setSentiment(null);

    try {
      const res = await fetch("/api/structured-enums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: submittedText }),
      });

      if (!res.ok) throw new Error("Failed to classify sentiment");

      const data = await res.json();
      // generateObject with enum output returns the value directly in the response.
      setSentiment(data as Sentiment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            type="text"
            placeholder="Enter text to analyze sentiment..."
            className="w-full bg-transparent px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </form>
  );

  // ─── WELCOME LAYOUT: centered input + greeting (before any submission) ───
  if (!started) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome icon & heading */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              {/* Sentiment gauge icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Sentiment Analyzer
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Enter any text and AI will classify its sentiment as positive, negative, or neutral using enum-based structured output.
            </p>
          </div>

          {/* Centered input bar */}
          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Enum output via Vercel AI SDK
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS LAYOUT: result card + fixed bottom input ───
  const config = sentiment ? sentimentConfig[sentiment] : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
        <div className="mx-auto max-w-2xl">
          {/* Error State */}
          {error && (
            <div className="animate-fade-in mb-5 flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Error: {error}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="animate-slide-in rounded-xl border border-border bg-surface-raised p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot"></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-sm text-text-tertiary">Analyzing sentiment...</span>
              </div>
            </div>
          )}

          {/* Sentiment Result Card */}
          {sentiment && config && !isLoading && (
            <div className="animate-fade-in-up space-y-4">
              {/* Result badge card */}
              <div className="rounded-xl border border-border bg-surface-raised p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  {/* Large sentiment emoji */}
                  <span className="text-5xl">{config.icon}</span>

                  {/* Sentiment label badge */}
                  <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${config.color} ${config.bg} ${config.border}`}>
                    {config.label}
                  </span>

                  {/* Explanation */}
                  <p className="text-sm text-text-tertiary max-w-sm">
                    The AI classified this text as <span className={`font-semibold ${config.color}`}>{config.label.toLowerCase()}</span>.
                  </p>
                </div>
              </div>

              {/* The analyzed text */}
              <div className="rounded-xl border border-border-light bg-background p-4">
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide block mb-2">Analyzed Text</span>
                <p className="text-[15px] leading-7 text-text-primary italic">&ldquo;{analyzedText}&rdquo;</p>
              </div>

              {/* All possible sentiments — to show what enum options exist */}
              <div className="rounded-xl border border-border bg-surface-raised p-4">
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide block mb-3">Possible Classifications</span>
                <div className="flex flex-wrap gap-2">
                  {(["positive", "negative", "neutral"] as Sentiment[]).map((s) => {
                    const c = sentimentConfig[s];
                    const isActive = s === sentiment;
                    return (
                      <span
                        key={s}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? `${c.color} ${c.bg} ${c.border} ring-1 ring-offset-1 ring-current`
                            : "border-border-light bg-background text-text-tertiary"
                        }`}
                      >
                        {c.icon} {c.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-light bg-background relative z-10">
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4">
          {inputBar}
        </div>
      </div>
    </>
  );
}

export default StructuredEnums;
