"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Image } from "@imagekit/next";
import {
  ImageDisplay,
  ImageLoadingState,
  ImageErrorState,
  ImageCompleteState,
} from "@/app/components/ImageDisplay";
import { ChatMessage } from "@/app/api/client-side-tool/route";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

function buildTransformationUrl(
  baseUrl: string,
  transformation: string,
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";

  return `${baseUrl}${separator}tr=${transformation}`;
}

// Convert FileList to data URL parts for sending as message parts.
async function convertFilesToDataURLs(
  files: FileList,
  onProgress?: (pct: number) => void,
) {
  const total = files.length;
  let done = 0;
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<{ type: "file"; mediaType: string; url: string }>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              done++;
              onProgress?.(Math.round((done / total) * 100));
              resolve({
                type: "file",
                mediaType: file.type,
                url: reader.result as string,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          },
        ),
    ),
  );
}

export default function ClientSideTool() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationTimeout, setGenerationTimeout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { messages, sendMessage, status, error, stop, addToolResult } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/client-side-tool",
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        if (toolCall.dynamic) return;
        switch (toolCall.toolName) {
          case "changeBackground": {
            const { imageUrl, backgroundPrompt } = toolCall.input;

            const transformation = `e-changebg-prompt-${backgroundPrompt}`;
            const transformedUrl = buildTransformationUrl(
              imageUrl,
              transformation,
            );

            addToolResult({
              toolCallId: toolCall.toolCallId,
              tool: 'changeBackground',
              output: transformedUrl,
            });
          }
          case "removeBackground": {
            const { imageUrl } = toolCall.input;

            const transformation = "e-bgremove";
            const transformedUrl = buildTransformationUrl(
              imageUrl,
              transformation,
            );

            addToolResult({
              toolCallId: toolCall.toolCallId,
              tool: "removeBackground",
              output: transformedUrl,
            });
          }
        }
      },
    });

  const [chatStarted, setChatStarted] = useState(false);
  const [pdfModal, setPdfModal] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Smart auto-scroll: follows streaming until user scrolls up manually.
  const userScrolledUp = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Detect if user has scrolled away from the bottom.
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user is within 80px of bottom, consider them "at bottom".
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  }, []);

  // Auto-scroll on new content — respects userScrolledUp.
  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const oversized = Array.from(e.target.files).filter(
      (f) => f.size > MAX_FILE_SIZE,
    );
    if (oversized.length > 0) {
      setFileError(
        `${oversized.map((f) => f.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} 4 MB limit`,
      );
      e.target.value = "";
      return;
    }
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !files?.length) return;
    setChatStarted(true);
    userScrolledUp.current = false;

    setIsProcessingFiles(true);
    setUploadProgress(0);

    const fileParts =
      files && files.length > 0
        ? await convertFilesToDataURLs(files, setUploadProgress)
        : [];

    setIsProcessingFiles(false);
    setUploadProgress(0);

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }, ...fileParts],
    });

    setInput("");
    setFiles(undefined);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isActive = status === "streaming" || status === "submitted";
  const sendDisabled = status !== "ready" || isProcessingFiles;

  // Client-side timeout for image generation (30 seconds max)
  useEffect(() => {
    if (isActive) {
      setGenerationTimeout(false);
      generationTimerRef.current = setTimeout(() => {
        setGenerationTimeout(true);
      }, 30000); // 30 seconds timeout
    } else {
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
        generationTimerRef.current = null;
      }
      setGenerationTimeout(false);
    }

    return () => {
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
      }
    };
  }, [isActive]);

  // ─── File attachment preview chips + progress ───
  const filePreview = (
    <>
      {fileError && (
        <div className="flex items-center gap-1.5 px-2 pb-1 text-xs text-error">
          <svg
            width="12"
            height="12"
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
          {fileError}
        </div>
      )}
      {files && files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1 pb-1">
          {Array.from(files).map((f, i) => {
            const isPdf = f.type === "application/pdf";
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-background px-2.5 py-1 text-xs text-text-secondary"
              >
                {isPdf ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-red-500"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15h6" />
                    <path d="M9 11h6" />
                  </svg>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-accent"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
                <span className="max-w-[120px] truncate">{f.name}</span>
                <span className="text-text-tertiary">
                  ({(f.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </span>
            );
          })}
        </div>
      )}
      {isProcessingFiles && (
        <div className="px-2 pb-1.5">
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
            <svg
              className="animate-spin h-3 w-3 text-accent"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-20"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Processing files... {uploadProgress}%
          </div>
          <div className="h-1 w-full rounded-full bg-border-light overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </>
  );

  // ─── The shared input bar used in both layouts ───
  const inputBar = (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-surface-raised p-1.5 transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-sm">
        {filePreview}
        <div className="relative flex items-center gap-1">
          {/* Attach button */}
          <label
            htmlFor="file-upload"
            className="ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors duration-200 hover:bg-surface hover:text-text-primary"
            title="Attach files"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </label>
          <input
            id="file-upload"
            type="file"
            placeholder="file-uplaod"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept="image/*,application/pdf"
            ref={fileInputRef}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full bg-transparent px-2 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
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
              disabled={sendDisabled}
              type="submit"
              className="mr-1 shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessingFiles ? "Wait..." : "Send"}
            </button>
          )}
        </div>
      </div>
    </form>
  );

  // ─── WELCOME LAYOUT ───
  if (!chatStarted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path
                  d="M21 15l-5-5L5 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              AI Image Generator
            </h1>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              Describe any image you want and AI will create it for you using
              advanced diffusion models.
            </p>
          </div>

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

          <div className="w-full">{inputBar}</div>

          <p className="text-xs text-text-tertiary">
            Powered by FLUX/dev via Firemoon AI & Gemini
          </p>
        </div>
      </div>
    );
  }

  // ─── CHAT LAYOUT ───
  return (
    <>
      {/* PDF Preview Modal */}
      {pdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
          <div className="relative flex flex-col w-full max-w-3xl h-[85vh] rounded-xl overflow-hidden bg-background border border-border shadow-2xl animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-light bg-surface">
              <div className="flex items-center gap-2 text-sm text-text-primary font-medium min-w-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-red-500"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15h6" />
                  <path d="M9 11h6" />
                </svg>
                <span className="truncate">{pdfModal.name}</span>
              </div>
              <button
                onClick={() => setPdfModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-raised hover:text-text-primary"
                title="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* PDF iframe */}
            <iframe
              src={pdfModal.url}
              title={pdfModal.name}
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
      >
        <div className="mx-auto max-w-2xl space-y-4">
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

          {/* Timeout Warning */}
          {generationTimeout && (
            <div className="animate-fade-in flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-50 p-3.5 text-amber-700 text-sm">
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
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">
                  Generation is taking longer than expected
                </p>
                <p className="text-xs opacity-80">
                  The image service may be experiencing issues. You can stop and
                  try again with a simpler prompt.
                </p>
              </div>
              <button
                onClick={stop}
                className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors"
              >
                Stop
              </button>
            </div>
          )}

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
                  <div className="flex gap-2">
                    {/* File parts first (images + PDFs at top) */}
                    {message.parts.map((part, index) => {
                      if (part.type !== "file") return null;
                      if (part.mediaType.startsWith("image/")) {
                        return (
                          <div
                            key={`${message.id}-file-${index}`}
                            className="mb-2 rounded-lg overflow-hidden max-w-[160px] sm:max-w-[200px]"
                          >
                            <Image
                              urlEndpoint={
                                process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                              }
                              src={part.url}
                              alt={part.filename ?? `attachment-${index}`}
                              width={200}
                              height={200}
                              className="rounded-lg object-cover w-full h-auto"
                            />
                          </div>
                        );
                      }
                      if (part.mediaType === "application/pdf") {
                        return (
                          <button
                            key={`${message.id}-file-${index}`}
                            type="button"
                            onClick={() =>
                              setPdfModal({
                                url: part.url,
                                name: part.filename ?? "PDF Document",
                              })
                            }
                            className={`mb-2 flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-all duration-150 hover:shadow-sm ${
                              isUser
                                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                                : "border-border-light bg-background text-text-secondary hover:border-accent/30"
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`shrink-0 ${isUser ? "text-white/80" : "text-red-500"}`}
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M9 15h6" />
                              <path d="M9 11h6" />
                            </svg>
                            <div className="min-w-0">
                              <div className="truncate max-w-[120px] sm:max-w-[180px] font-medium">
                                {part.filename ?? "PDF Document"}
                              </div>
                              <div
                                className={`text-[10px] ${isUser ? "text-white/60" : "text-text-tertiary"}`}
                              >
                                Click to preview
                              </div>
                            </div>
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  {/* Text parts after files */}
                  {message.parts.map((part, index) => {
                    if (part.type !== "text") return null;
                    return (
                      <p
                        key={`${message.id}-text-${index}`}
                        className={`whitespace-pre-wrap text-[15px] leading-7 ${isUser ? "" : "pl-6"}`}
                      >
                        {part.text}
                      </p>
                    );
                  })}

                  {/* Tool invocations for generateImage */}
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "tool-generateImage": {
                        switch (part.state) {
                          case "input-streaming":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <ImageLoadingState stage="preparing" />
                              </div>
                            );
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <ImageLoadingState stage="generating" />
                              </div>
                            );
                          case "output-available": {
                            // The output is the ImageKit URL from the tool
                            const imageUrl = part.output as string;
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3 space-y-3"
                              >
                                <ImageCompleteState />
                                <ImageDisplay
                                  imageData={imageUrl}
                                  prompt={part.input?.prompt || ""}
                                />
                              </div>
                            );
                          }
                          case "output-error": {
                            // Format error message to be user-friendly
                            let displayError =
                              part.errorText || "Unable to generate the image.";

                            // Handle specific error codes from the server
                            if (
                              displayError.includes("IMAGE_TIMEOUT_ERROR") ||
                              displayError.includes("Connect Timeout") ||
                              displayError.includes("firemoon.studio") ||
                              displayError.includes("Failed after") ||
                              displayError.includes("Cannot connect to API")
                            ) {
                              displayError =
                                "The image service is experiencing connectivity issues. This usually happens when the AI service is overloaded or having network problems. Please wait a moment and try again.";
                            } else if (
                              displayError.includes("IMAGE_GENERATION_FAILED")
                            ) {
                              displayError = displayError.replace(
                                "IMAGE_GENERATION_FAILED: ",
                                "",
                              );
                            }

                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <ImageErrorState error={displayError} />
                              </div>
                            );
                          }
                          default:
                            return null;
                        }
                      }
                      case "tool-removeBackground": {
                        switch (part.state) {
                          case "input-streaming":
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg border-2 border-violet-200 border-t-violet-500 animate-spin" />
                                    <span className="text-sm text-text-secondary">Removing background...</span>
                                  </div>
                                </div>
                              </div>
                            );
                          case "output-available": {
                            const imageUrl = part.output as string;
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3 space-y-3"
                              >
                                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                      <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Background removed</span>
                                  </div>
                                </div>
                                <ImageDisplay imageData={imageUrl} prompt="Background removed" />
                              </div>
                            );
                          }
                          case "output-error":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <ImageErrorState error={part.errorText || "Failed to remove background"} />
                              </div>
                            );
                          default:
                            return null;
                        }
                      }
                      case "tool-changeBackground": {
                        switch (part.state) {
                          case "input-streaming":
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg border-2 border-fuchsia-200 border-t-fuchsia-500 animate-spin" />
                                    <span className="text-sm text-text-secondary">Changing background...</span>
                                  </div>
                                </div>
                              </div>
                            );
                          case "output-available": {
                            const imageUrl = part.output as string;
                            const newBg = (part.input as { backgroundPrompt?: string })?.backgroundPrompt || "custom background";
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3 space-y-3"
                              >
                                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                      <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Background changed to: {newBg}</span>
                                  </div>
                                </div>
                                <ImageDisplay imageData={imageUrl} prompt={`Background: ${newBg}`} />
                              </div>
                            );
                          }
                          case "output-error":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="mt-3"
                              >
                                <ImageErrorState error={part.errorText || "Failed to change background"} />
                              </div>
                            );
                          default:
                            return null;
                        }
                      }
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            );
          })}

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
