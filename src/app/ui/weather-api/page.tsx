"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatMessage } from "@/app/api/weather-api/route";
import WeatherCard from "@/app/components/WeatherCard";

export default function ToosPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/weather-api",
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-600"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  fill="currentColor"
                  fillOpacity="0.2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Check the Weather
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Ask about weather in any city worldwide. Get real-time
              temperature, conditions, and local time.
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
                      case "tool-getWeather":
                        switch (part.state) {
                          case "input-streaming":
                            return (
                              <div
                                key={`${message.id}-getWeather-${index}`}
                                className="mt-3 rounded-xl border border-border/60 bg-surface-raised/80 backdrop-blur-sm p-4 animate-fade-in"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20 animate-pulse" />
                                    <div className="relative h-full w-full rounded-xl bg-blue-500/10 flex items-center justify-center">
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        className="text-blue-500"
                                      >
                                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-text-primary">
                                      Analyzing Weather Request
                                    </p>
                                    <p className="text-xs text-text-tertiary">
                                      Processing city name...
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <div
                                      className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    />
                                    <div
                                      className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    />
                                    <div
                                      className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-getWeather-${index}`}
                                className="mt-3 rounded-xl border-l-4 border-l-blue-500 border-y border-r border-border bg-gradient-to-r from-blue-50/50 to-transparent p-4 animate-fade-in"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      className="text-blue-600"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-text-primary">
                                      Fetching Weather Data
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                      Looking up weather for{" "}
                                      <span className="font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                        {part.input.city}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                </div>
                              </div>
                            );
                          case "output-available":
                            return (
                              <div
                                key={`${message.id}-getWeather-${index}`}
                                className="mt-3 animate-fade-in"
                              >
                                {part.output &&
                                typeof part.output === "object" &&
                                "location" in part.output &&
                                "current" in part.output ? (
                                  <WeatherCard
                                    data={
                                      part.output as {
                                        location: {
                                          name: string;
                                          country: string;
                                          localtime: string;
                                        };
                                        current: {
                                          temp_c: number;
                                          condition: {
                                            text: string;
                                            code: number;
                                          };
                                        };
                                      }
                                    }
                                  />
                                ) : (
                                  <div className="rounded-xl border border-border bg-surface-raised p-4 text-text-primary">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-accent"
                                      >
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line
                                          x1="15"
                                          y1="9"
                                          x2="15.01"
                                          y2="9"
                                        />
                                      </svg>
                                      <span className="text-sm font-medium">
                                        Weather Result
                                      </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                      {JSON.stringify(part.output)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          case "output-error":
                            return (
                              <div
                                key={`${message.id}-getWeather-${index}`}
                                className="mt-3 rounded-xl border border-error/30 bg-gradient-to-r from-error/5 to-error/10 p-4 animate-fade-in"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-error/20 flex items-center justify-center shrink-0">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      className="text-error"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="15" y1="9" x2="9" y2="15" />
                                      <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-error">
                                      Weather Lookup Failed
                                    </p>
                                    <p className="text-xs text-error/70 mt-1">
                                      {part.errorText ||
                                        "Unable to fetch weather data. Please try again."}
                                    </p>
                                  </div>
                                </div>
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
