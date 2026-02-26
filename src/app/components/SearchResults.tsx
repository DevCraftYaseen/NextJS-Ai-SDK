"use client";

import React from "react";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlFormattedUrl?: string;
  displayLink?: string;
}

interface SearchResultsProps {
  results?: SearchResult[];
  query?: string;
  totalResults?: string;
  searchTime?: string;
}

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
};

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default function SearchResults({
  results = [],
  query,
  totalResults,
  searchTime,
}: SearchResultsProps) {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-surface-raised/80 p-4 animate-fade-in">
        <div className="flex items-center gap-2 text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-sm">Search completed. Processing results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Search Header */}
      {(query || totalResults) && (
        <div className="flex items-center justify-between text-xs text-text-tertiary mb-2">
          {query && (
            <span className="font-medium text-accent">
              Search: "{query}"
            </span>
          )}
          {totalResults && (
            <span>{totalResults} results</span>
          )}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid gap-2">
        {results.map((result, index) => (
          <a
            key={index}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-surface-raised hover:border-accent/30 hover:shadow-sm transition-all duration-200"
          >
            {/* Favicon */}
            <div className="shrink-0 w-8 h-8 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
              <img
                src={getFaviconUrl(result.link)}
                alt=""
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-text-tertiary"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
                  }
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                {result.title}
              </h4>
              <p className="text-xs text-text-tertiary mt-0.5">
                {getDomain(result.link)}
              </p>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                {result.snippet}
              </p>
            </div>

            {/* External Link Icon */}
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* View All Results Link */}
      {query && (
        <div className="pt-2">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <span>View more results on Google</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

// Tool State Components
export function SearchLoadingState({ stage }: { stage: "preparing" | "searching" | "analyzing" }) {
  const stages = {
    preparing: {
      title: "Preparing Search",
      subtitle: "Analyzing your query...",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    searching: {
      title: "Searching the Web",
      subtitle: "Finding relevant sources...",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    analyzing: {
      title: "Analyzing Results",
      subtitle: "Processing information...",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
  };

  const current = stages[stage];

  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20 animate-pulse" />
          <div className="relative h-full w-full rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            {current.icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{current.title}</p>
          <p className="text-xs text-text-tertiary">{current.subtitle}</p>
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export function SearchErrorState({ error }: { error?: string }) {
  return (
    <div className="rounded-xl border border-error/30 bg-gradient-to-r from-error/5 to-error/10 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-error/20 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-error">Search Failed</p>
          <p className="text-xs text-error/70 mt-1">{error || "Unable to perform search. Please try again."}</p>
        </div>
      </div>
    </div>
  );
}

export function SearchCompleteState({ resultCount }: { resultCount?: number }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-sm font-medium text-text-primary">
          Search complete{resultCount ? ` · ${resultCount} sources found` : ""}
        </span>
      </div>
    </div>
  );
}
