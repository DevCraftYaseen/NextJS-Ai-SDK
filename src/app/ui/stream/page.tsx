"use client";

import { useCompletion } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";

export default function CompletionPage() {
  // useCompletion hook from AI SDK — handles state, fetch, and stream parsing.
  // It sends a POST to the api endpoint and parses the text stream chunks
  // automatically, updating `completion` on each chunk for real-time display.
  const {
    completion,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useCompletion({
    // Points to our streaming API route
    api: "/api/stream",
  });

  // Tracks whether the user has ever submitted — once true, stays true.
  // This keeps the layout in "chat mode" even after a response finishes,
  // so the input stays at the bottom instead of jumping back to center.
  const [chatStarted, setChatStarted] = useState(false);

  // Ref to the scrollable chat container so we can auto-scroll to bottom
  // as new streamed text arrives, keeping the latest content visible.
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the chat area to the bottom on every completion update.
  // This fires on each streamed chunk, keeping the view pinned to the
  // latest text without the user needing to scroll manually.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completion, isLoading]);

  // Wraps the form submit — marks chat as started so layout switches
  // from "welcome centered" mode to "chat mode" with fixed bottom input.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChatStarted(true);
    setInput("");
    handleSubmit(e);
  };

  // ─── The shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={onSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="How can I help you?"
            className="w-full bg-transparent px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          {/* Show Stop button while streaming, Send button otherwise */}
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="mr-1 shrink-0 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-border-light"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </form>
  );

  // ─── WELCOME LAYOUT: centered input + greeting (no chat yet) ───
  if (!chatStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-text-primary">
              How can I help you today?
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Ask me anything. Responses stream in real-time powered by Gemini.
            </p>
          </div>

          {/* Error shown above input even in welcome state */}
          {error && (
            <div className="w-full animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Error: {error.message}</span>
            </div>
          )}

          {/* Centered input bar */}
          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Streaming via Vercel AI SDK
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
        className="flex-1 overflow-y-auto px-6 pt-6 pb-6"
      >
        <div className="mx-auto max-w-2xl animate-fade-in-up">
          {/* Error State */}
          {error && (
            <div className="animate-fade-in mb-5 flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Error: {error.message}</span>
            </div>
          )}

          {/* Response area — shown while loading OR when completion text exists.
              NO CSS animation on the <p> because animations re-trigger on every
              React re-render (every chunk), causing flicker instead of smoothness. */}
          {(completion || isLoading) && (
            <div className="animate-slide-in rounded-xl border border-border bg-surface-raised p-5">
              <div className="mb-1 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-accent-light flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Assistant</span>
                {/* Pulsing dots appear while the stream is active */}
                {isLoading && (
                  <div className="flex items-center gap-1 ml-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                )}
              </div>
              {/* The streamed text — no animation class here.
                  React updates this <p> on every chunk. Adding an animation
                  would restart it on each update, causing visible flicker.
                  The text simply appears character by character — naturally smooth. */}
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-text-primary pl-7">
                {completion}
              </p>
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
        <div className="mx-auto max-w-2xl px-6 py-4">
          {inputBar}
        </div>
      </div>
    </div>
  );
}
