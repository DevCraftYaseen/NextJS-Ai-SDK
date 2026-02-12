"use client";

import { useState, useRef, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { pokemonUiSchema } from "@/app/api/structured-array/schema";

function StructuredArray() {
  const [type, setType] = useState("");

  // useObject with output:'array' — streams an array of Pokémon objects.
  const { submit, object, isLoading, stop, error } = useObject({
    api: "/api/structured-array",
    schema: pokemonUiSchema,
  });

  // Tracks whether the user has ever submitted — switches to results layout.
  const [started, setStarted] = useState(false);

  // Ref to scrollable content area for auto-scrolling as new Pokémon stream in.
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when the array grows (new items streaming in).
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [object, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim()) return;
    setStarted(true);
    submit({ type });
    setType("");
  };

  // ─── Shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            type="text"
            placeholder="Enter a Pokémon type (e.g. fire, water, grass)..."
            className="w-full bg-transparent px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
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

  // ─── WELCOME LAYOUT: centered input + greeting (before any submission) ───
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome icon & heading */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              {/* Pokéball-style icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Discover Pokémon by Type
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Enter a Pokémon type and get a list of 5 Pokémon with their abilities, streamed in real-time.
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
            Powered by Gemini &middot; Structured array output via Vercel AI SDK
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS LAYOUT: scrollable Pokémon cards + fixed bottom input ───
  // The streamed object is an array of { name, abilities[] }.
  const pokemonList = Array.isArray(object) ? object : [];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Scrollable results area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
      >
        <div className="mx-auto max-w-2xl">
          {/* Error State */}
          {error && (
            <div className="animate-fade-in mb-5 flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Error: {error.message}</span>
            </div>
          )}

          {/* Loading — shown before any Pokémon data arrives */}
          {isLoading && pokemonList.length === 0 && (
            <div className="animate-slide-in rounded-xl border border-border bg-surface-raised p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot"></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-sm text-text-tertiary">Finding Pokémon...</span>
              </div>
            </div>
          )}

          {/* Pokémon Cards — each Pokémon rendered as a card with name + ability badges */}
          {pokemonList.length > 0 && (
            <div className="animate-fade-in-up space-y-3">
              {/* Section header with streaming indicator */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Results &middot; {pokemonList.length} Pokémon
                </h2>
                {isLoading && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                )}
              </div>

              {pokemonList.map((pokemon, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface-raised p-4 transition-all duration-200 hover:border-accent/20 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Pokémon number badge */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-text-primary capitalize">
                      {pokemon?.name || "Loading..."}
                    </h3>
                  </div>
                  {/* Abilities as badge pills */}
                  {pokemon?.abilities && pokemon.abilities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-10">
                      {pokemon.abilities.map((ability, abilityIdx) => (
                        <span
                          key={abilityIdx}
                          className="rounded-full border border-border-light bg-background px-3 py-1 text-xs font-medium text-text-secondary"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed input bar at the bottom */}
      <div className="shrink-0 border-t border-border-light bg-background relative z-10">
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4">
          {inputBar}
        </div>
      </div>
    </div>
  );
}

export default StructuredArray;
