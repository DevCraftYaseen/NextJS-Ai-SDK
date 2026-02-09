"use client";

import React, { useState } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState(""); // User Input
  const [completion, setCompletion] = useState(""); // Ai Response
  const [isLoading, setIsLoading] = useState(false); // Loading State
  const [error, setError] = useState<string | null>(null); // Error State

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            AI Completion
          </h1>
          <p className="text-text-tertiary text-sm">
            Generate intelligent completions using advanced AI technology
          </p>
        </div>

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
          <div className="animate-slide-in mb-5 rounded-xl border border-border bg-surface-raised p-5">
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
          <div className="animate-fade-in-up mb-6 rounded-xl border border-border bg-surface-raised p-5">
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
            <p className="animate-stream-in text-[15px] leading-7 text-text-primary pl-7">{completion}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={complete} className="mt-6">
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

        {/* Footer Info */}
        {!completion && !isLoading && (
          <div className="mt-10 pt-6 border-t border-border-light">
            <p className="text-center text-text-tertiary text-xs">
              Enter a prompt above to generate AI completions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
