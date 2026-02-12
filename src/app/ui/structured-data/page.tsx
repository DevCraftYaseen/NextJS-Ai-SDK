"use client";

import { useState, useRef, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

function StructuredData() {
  const [dishName, setDishName] = useState("");

  const { submit, object, isLoading, stop, error } = useObject({
    api: "/api/structured-data",
    schema: recipeSchema,
  });

  // Tracks whether the user has ever submitted — once true, stays true.
  // Keeps layout in "recipe mode" so input stays at the bottom.
  const [chatStarted, setChatStarted] = useState(false);

  // Ref to scrollable content area for auto-scrolling as recipe data streams in.
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when the recipe object updates (new fields streaming in).
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [object, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    setChatStarted(true);
    submit({ dish: dishName });
    setDishName("");
  };

  // ─── The shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            type="text"
            placeholder="Ask me for any dish recipe..."
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

  // ─── WELCOME LAYOUT: centered input + greeting (no recipe yet) ───
  if (!chatStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.15"/>
                <path d="M15 11h-2V9a1 1 0 0 0-2 0v2H9a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              What would you like to cook?
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Enter a dish name and get a full recipe with ingredients and step-by-step instructions.
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
            Powered by Gemini &middot; Structured output via Vercel AI SDK
          </p>
        </div>
      </div>
    );
  }

  // ─── RECIPE LAYOUT: scrollable content + fixed bottom input ───
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Scrollable recipe area — takes all space above the input.
          overflow-y-auto lets the recipe scroll while input stays fixed. */}
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

          {/* Loading State — shown while waiting for the first recipe data */}
          {isLoading && !object?.recipe && (
            <div className="animate-slide-in rounded-xl border border-border bg-surface-raised p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot"></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-sm text-text-tertiary">Generating recipe...</span>
              </div>
            </div>
          )}

          {/* Recipe Display — structured card with name, ingredients, and steps */}
          {object?.recipe && (
            <div className="animate-fade-in-up space-y-5">
              {/* Recipe Header */}
              <div className="rounded-xl border border-border bg-surface-raised p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Recipe</span>
                    <h2 className="text-xl font-semibold text-text-primary leading-tight">{object.recipe.name}</h2>
                  </div>
                </div>
                {/* Streaming indicator next to recipe name */}
                {isLoading && (
                  <div className="flex items-center gap-1 mt-2 pl-11">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }}></div>
                    <span className="text-xs text-text-tertiary ml-1">Generating...</span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              {object?.recipe?.ingredients && object.recipe.ingredients.length > 0 && (
                <div className="rounded-xl border border-border bg-surface-raised p-5">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                    </svg>
                    Ingredients
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {object?.recipe?.ingredients.map((ing, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-background px-3.5 py-2.5 border border-border-light"
                      >
                        <span className="text-[14px] text-text-primary">{ing?.name}</span>
                        <span className="text-[13px] text-text-tertiary font-medium ml-3 shrink-0">{ing?.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {object?.recipe?.steps && object.recipe.steps.length > 0 && (
                <div className="rounded-xl border border-border bg-surface-raised p-5">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Instructions
                  </h3>
                  <ol className="space-y-3">
                    {object?.recipe?.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-[15px] leading-7 text-text-primary">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed input bar at the bottom — sits outside the scroll container
          so it never moves. Gradient fade hides content scrolling behind it. */}
      <div className="shrink-0 border-t border-border-light bg-background relative z-10">
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4">
          {inputBar}
        </div>
      </div>
    </div>
  );
}

export default StructuredData;
