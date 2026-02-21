"use client";

import { useState, useRef, useCallback } from "react";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    const currentText = text.trim();
    setStarted(true);
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
    setText("");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate speech");
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error("TTS Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `tts-audio-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Shared input bar ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        <div className="relative flex items-end gap-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={1}
            className="w-full bg-transparent px-3 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none resize-none min-h-[44px] max-h-[120px]"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            disabled={isLoading || !text.trim()}
            type="submit"
            className="mb-0.5 mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
                <span className="hidden sm:inline">Speak</span>
              </>
            )}
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
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" opacity="0.15"/>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Text to Speech
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Convert any text into natural-sounding speech using Gemini&apos;s TTS capabilities.
            </p>
          </div>

          {error && (
            <div className="w-full animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Error: {error}</span>
            </div>
          )}

          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Text-to-Speech via Google Gen AI
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS LAYOUT ───
  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
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
                <p className="text-sm font-medium text-text-primary">Generating audio...</p>
                <p className="text-xs text-text-tertiary">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && !isLoading && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" opacity="0.3"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Generated Audio</h3>
                    <p className="text-xs text-text-tertiary">Ready to play or download</p>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full mb-4"
                />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download MP3
                  </button>
                  <button
                    onClick={clearAudio}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border-light bg-background px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-error/30 hover:text-error"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Clear
                  </button>
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
