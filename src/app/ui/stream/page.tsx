"use client";

import { useCompletion } from "@ai-sdk/react";

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

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            AI Stream
          </h1>
          <p className="text-text-tertiary text-sm">Powered by Gemini Streaming</p>
        </div>

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
            This lets the user see text appear in real-time as chunks arrive.
            NO CSS animation on the <p> because animations re-trigger on every
            React re-render (every chunk), causing flicker instead of smoothness. */}
        {(completion || isLoading) && (
          <div className="animate-slide-in mb-6 rounded-xl border border-border bg-surface-raised p-5">
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

        {/* Input Form — inline input + button layout */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Clear the input immediately so user sees it was sent
            setInput("");
            handleSubmit(e);
          }}
          className="mt-6"
        >
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
      </div>
    </div>
  );
}
