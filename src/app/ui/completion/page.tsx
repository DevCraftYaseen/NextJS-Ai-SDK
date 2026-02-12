"use client";

import React, { useState, useRef, useEffect } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState(""); // User Input
  const [completion, setCompletion] = useState(""); // Ai Response
  const [isLoading, setIsLoading] = useState(false); // Loading State
  const [error, setError] = useState<string | null>(null); // Error State

  // Tracks whether the user has ever submitted — once true, stays true.
  // This keeps the layout in "chat mode" even after a response finishes,
  // so the input stays at the bottom instead of jumping back to center.
  const [chatStarted, setChatStarted] = useState(false);

  // Ref to the scrollable chat container so we can auto-scroll to bottom
  // when new content appears (loading indicator or completed response).
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the chat area to the bottom when completion or loading changes.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completion, isLoading]);

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setChatStarted(true);
    setIsLoading(true);
    setPrompt("");
    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setCompletion(data.text);
      

    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong, Please try again later",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── The shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={complete}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="How can I help you?"
            className="w-full bg-transparent px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          <button
            disabled={isLoading}
            type="submit"
            className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Send"}
          </button>
        </div>
      </div>
    </form>
  );

  // ─── WELCOME LAYOUT: centered input + greeting (no chat yet) ───
  if (!chatStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              How can I help you today?
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Ask me anything. Get instant AI-generated completions powered by Gemini.
            </p>
          </div>

          {/* Error shown above input even in welcome state */}
          {error && (
            <div className="w-full animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Centered input bar */}
          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Built with Next.js &amp; Vercel AI SDK
          </p>
        </div>
      </div>
    );
  }

  // ─── CHAT LAYOUT: scrollable messages + fixed bottom input ───
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Scrollable chat area — takes all available space above the input.
          overflow-y-auto lets it scroll independently while input stays fixed.
          pb-6 gives breathing room at the bottom of the scroll area. */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
      >
        <div className="mx-auto max-w-2xl animate-fade-in-up">
          {/* Error Message */}
          {error && (
            <div className="animate-fade-in mb-5 flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
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
                <span className="text-sm text-text-tertiary">Generating response...</span>
              </div>
            </div>
          )}

          {/* Completion Display */}
          {completion && !isLoading && (
            <div className="animate-fade-in-up rounded-xl border border-border bg-surface-raised p-5">
              <div className="mb-1 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-accent-light flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Assistant</span>
              </div>
              <p className="text-[15px] leading-7 text-text-primary pl-7">{completion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed input bar at the bottom — sits outside the scroll container
          so it never moves. A top border and gradient fade visually separate
          it from the chat. z-10 ensures it renders above any scroll content. */}
      <div className="shrink-0 border-t border-border-light bg-background relative z-10">
        {/* Gradient fade — gives a soft transition between chat and input,
            hiding content that scrolls behind the input bar. */}
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4">
          {inputBar}
        </div>
      </div>
    </div>
  );
}
