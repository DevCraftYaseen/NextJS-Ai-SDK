"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageDisplayProps {
  imageData: string;
  prompt?: string;
  aspectRatio?: string;
}

export function ImageDisplay({ imageData, prompt, aspectRatio = "16:9" }: ImageDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine if input is a URL or base64 data
  const isUrl = imageData.startsWith("http://") || imageData.startsWith("https://");
  const imageUrl = isUrl ? imageData : (imageData.startsWith("data:") ? imageData : `data:image/png;base64,${imageData}`);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Main Image Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {/* Gradient Header */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
        
        {/* Image Container */}
        <div className="relative aspect-video bg-surface-raised overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-raised">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-lg border-2 border-violet-200 border-t-violet-500 animate-spin" />
                  <svg
                    className="absolute inset-0 m-auto h-4 w-4 text-violet-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <span className="text-xs text-text-tertiary">Loading image...</span>
              </div>
            </div>
          )}
          <Image
            src={imageUrl}
            alt={prompt || "Generated image"}
            fill
            className={`object-cover transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onLoad={() => setIsLoaded(true)}
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Hover Overlay */}
          {isLoaded && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 cursor-pointer group">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-white text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  Click to expand
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Info & Actions */}
        <div className="border-t border-border-light bg-surface px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Prompt */}
              {prompt && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <svg className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <span className="truncate text-sm text-text-secondary max-w-[200px] sm:max-w-[300px]">
                    {prompt}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-raised hover:text-text-primary"
                title="Download image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-raised hover:text-text-primary"
                title="View fullscreen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <Image
              src={imageUrl}
              alt={prompt || "Generated image"}
              width={1920}
              height={1080}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Loading State Component
export function ImageLoadingState({ stage }: { stage: "preparing" | "generating" }) {
  const stages = {
    preparing: {
      title: "Preparing generation",
      description: "Analyzing your prompt...",
      color: "violet",
    },
    generating: {
      title: "Generating image",
      description: "Creating your masterpiece with AI...",
      color: "fuchsia",
    },
  };

  const current = stages[stage];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-${current.color}-100 dark:bg-${current.color}-900/20`}>
          <div className={`h-6 w-6 rounded-lg border-2 border-${current.color}-200 border-t-${current.color}-500 animate-spin`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-primary">{current.title}</h4>
          <p className="mt-1 text-sm text-text-tertiary">{current.description}</p>
          
          {/* Progress Bar Animation */}
          <div className="mt-4 h-2 w-full rounded-full bg-border-light overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r from-${current.color}-500 to-${current.color}-400 animate-progress`}
              style={{ 
                width: stage === "preparing" ? "40%" : "75%",
                animation: "progress 2s ease-in-out infinite"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error State Component
export function ImageErrorState({ error }: { error?: string }) {
  return (
    <div className="rounded-xl border border-error/20 bg-error-light p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10">
          <svg className="h-5 w-5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-error">Generation failed</h4>
          <p className="mt-1 text-sm text-error/80">
            {error || "Unable to generate the image. Please try again with a different prompt."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Complete State Component
export function ImageCompleteState() {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="text-sm font-medium text-green-700 dark:text-green-400">Image generated successfully</span>
      </div>
    </div>
  );
}
