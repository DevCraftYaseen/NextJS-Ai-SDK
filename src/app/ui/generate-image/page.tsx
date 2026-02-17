"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [imageSrc, isLoading, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);
    setImageSrc(null);
    userScrolledUp.current = false;

    const currentPrompt = prompt;
    setPrompt("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setImageSrc(`data:image/png;base64,${data}`);
    } catch (err) {
      console.error("Error Generating Image", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared input bar ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center gap-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full bg-transparent px-3 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          <button
            disabled={isLoading || !prompt.trim()}
            type="submit"
            className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </form>
  );

  // ─── WELCOME LAYOUT ───
  if (!started) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Generate Image
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Describe any image and AI will create it for you using Flux.
            </p>
          </div>

          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Flux &middot; Image generation via Firemoon AI
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS LAYOUT ───
  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
      >
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
            <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-2 border-border-light"></div>
                <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-2 border-accent/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-text-primary">Generating your image...</p>
                <p className="text-xs text-text-tertiary">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Generated Image */}
          {imageSrc && !isLoading && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-surface-raised shadow-sm">
                <Image
                  alt="Generated Image"
                  src={imageSrc}
                  width={1024}
                  height={576}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={imageSrc}
                  download="generated-image.png"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </a>
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
