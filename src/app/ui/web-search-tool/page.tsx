"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import SearchResults, { SearchLoadingState, SearchErrorState, SearchCompleteState } from "@/app/components/SearchResults";

// Define the expected tool invocation type
interface GoogleSearchSource {
  title?: string;
  link?: string;
  url?: string;
  snippet?: string;
}

interface GoogleSearchOutput {
  sources?: GoogleSearchSource[];
}

export default function WebSearchTool() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/web-search-tool",
    }),
  });

  // Tracks whether the user has ever sent a message — once true, stays true.
  // Keeps layout in "chat mode" so input stays at bottom between messages.
  const [chatStarted, setChatStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleScrollEvent = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChatStarted(true);
    userScrolledUp.current = false;
    sendMessage({ text: input });
    setInput("");
  };

  // Helper: checks if AI is currently generating a response
  // FIX: original code had `status === "streaming" || status === "submitted" && (...)`
  // which is a precedence bug — && binds tighter than ||.
  // Wrapping in a helper avoids that entirely.
  const isActive = status === "streaming" || status === "submitted";

  // ─── The shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-transparent px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          {/* Show Stop button while AI is generating, Send button otherwise */}
          {isActive ? (
            <button
              onClick={stop}
              type="button"
              className="mr-1 shrink-0 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-border-light"
            >
              Stop
            </button>
          ) : (
            <button
              disabled={status !== "ready"}
              type="submit"
              className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
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
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          {/* Welcome message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-emerald-600"
              >
                <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Web Search
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Ask anything and get real-time search results with sources from across the web.
            </p>
          </div>

          {/* Error shown above input even in welcome state */}
          {error && (
            <div className="w-full animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{error.message}</span>
            </div>
          )}

          {/* Centered input bar */}
          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Multi-turn chat via Vercel AI SDK
          </p>
        </div>
      </div>
    );
  }

  // ─── CHAT LAYOUT: scrollable messages + fixed bottom input ───
  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScrollEvent}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Error State */}
          {error && (
            <div className="animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{error.message}</span>
            </div>
          )}

          {/* Messages — user messages right-aligned, AI messages left-aligned */}
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                    isUser
                      ? "bg-accent text-white rounded-br-md"
                      : "border border-border bg-surface-raised text-text-primary rounded-bl-md"
                  }`}
                >
                  {/* AI messages get the assistant label */}
                  {!isUser && (
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-accent-light flex items-center justify-center">
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-accent"
                        >
                          <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            fill="currentColor"
                            opacity="0.3"
                          />
                          <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
                        Assistant
                      </span>
                    </div>
                  )}
                  {/* Render each text part of the message */}
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <p
                            key={`${message.id}-${index}`}
                            className={`whitespace-pre-wrap text-[15px] leading-7 ${
                              isUser ? "" : "pl-6"
                            }`}
                          >
                            {part.text}
                          </p>
                        );
                      case "tool-google_search":
                        switch (part.state) {
                          case "input-streaming":
                            return (
                              <div key={`${message.id}-googleSearch-${index}`} className="mt-3">
                                <SearchLoadingState stage="preparing" />
                              </div>
                            );
                          case "input-available":
                            return (
                              <div key={`${message.id}-googleSearch-${index}`} className="mt-3">
                                <SearchLoadingState stage="searching" />
                              </div>
                            );
                          case "output-available": {
                            // Extract sources from the output - Google's search returns 'sources' array
                            const output = part.output as GoogleSearchOutput | undefined;
                            const sources = output?.sources || [];
                            
                            // Map sources to the SearchResult format
                            const results = sources.map((source) => ({
                              title: source.title || "Untitled",
                              link: source.link || source.url || "#",
                              snippet: source.snippet || "",
                            }));
                            
                            return (
                              <div key={`${message.id}-googleSearch-${index}`} className="mt-3 space-y-3">
                                <SearchCompleteState resultCount={results.length} />
                                <SearchResults results={results} />
                              </div>
                            );
                          }
                          case "output-error":
                            return (
                              <div key={`${message.id}-googleSearch-${index}`} className="mt-3">
                                <SearchErrorState error={typeof part.errorText === 'string' ? part.errorText : undefined} />
                              </div>
                            );
                          default:
                            return null;
                        }
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            );
          })}

          {/* Thinking indicator — shown when AI is processing but hasn't
              started streaming yet (no assistant message in progress) */}
          {isActive &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="flex justify-start animate-slide-in">
                <div className="rounded-2xl rounded-bl-md border border-border bg-surface-raised px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"></div>
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-text-tertiary">
                      Thinking...
                    </span>
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
