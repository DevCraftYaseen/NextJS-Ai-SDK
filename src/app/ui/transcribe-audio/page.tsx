"use client";

import { useState, useRef, useCallback } from "react";

export default function TranscribeAudio() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [started, setStarted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const transcribe = async () => {
    if (!audioBlob) return;

    setStarted(true);
    setIsLoading(true);
    setError(null);
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setTranscript(data.transcript);
    } catch (err) {
      console.error("Error transcribing audio:", err);
      setError(err instanceof Error ? err.message : "Failed to transcribe audio");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared control bar ───
  const controlBar = (
    <div className="space-y-4">
      {/* Recording / Upload Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Record Button */}
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.3"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Record Audio
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-error/90 w-full sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.3"/>
            </svg>
            Stop Recording
          </button>
        )}

        <span className="text-text-tertiary text-sm hidden sm:block">or</span>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          disabled={isLoading || isRecording}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-200 hover:border-accent/30 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Audio
        </button>
      </div>

      {/* Audio Preview */}
      {audioUrl && (
        <div className="animate-fade-in rounded-xl border border-border bg-surface-raised p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium text-text-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
              Audio Preview
            </span>
            <button
              onClick={clearAudio}
              disabled={isLoading}
              className="text-xs text-text-tertiary hover:text-error transition-colors duration-200 shrink-0"
            >
              Clear
            </button>
          </div>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Transcribe Button */}
      {audioBlob && !isRecording && (
        <div className="flex justify-center">
          <button
            onClick={transcribe}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Transcribing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
                Transcribe Audio
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // ─── WELCOME LAYOUT ───
  if (!started) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Transcribe Audio
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Record or upload audio and get accurate AI-generated transcriptions using Gemini.
            </p>
          </div>

          {/* Error shown above controls even in welcome state */}
          {error && (
            <div className="w-full animate-fade-in flex items-center gap-2.5 rounded-lg border border-error/20 bg-error-light p-3.5 text-error text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="w-full max-w-lg">{controlBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by Gemini &middot; Supports multiple audio formats
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
                <p className="text-sm font-medium text-text-primary">Transcribing your audio...</p>
                <p className="text-xs text-text-tertiary">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Transcription Result */}
          {transcript && !isLoading && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-xl border border-border bg-surface-raised p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-accent-light flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" opacity="0.5"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Transcription</span>
                </div>
                <p className="text-[15px] leading-7 text-text-primary whitespace-pre-wrap">{transcript}</p>
              </div>

              {/* Copy Button */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(transcript)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-light bg-background relative z-10">
        <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4">
          {controlBar}
        </div>
      </div>
    </>
  );
}
