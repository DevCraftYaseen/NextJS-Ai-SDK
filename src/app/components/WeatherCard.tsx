"use client";

import React from "react";

interface WeatherData {
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

interface WeatherCardProps {
  data: WeatherData;
}

// Weather condition codes from WeatherAPI
// https://www.weatherapi.com/docs/weather_conditions.json
const getWeatherTheme = (
  conditionText: string,
  code: number,
): {
  gradient: string;
  icon: React.ReactNode;
  textColor: string;
  accentColor: string;
  bgColor: string;
} => {
  const text = conditionText.toLowerCase();

  // Sunny / Clear
  if (code === 1000 || text.includes("sunny") || text.includes("clear")) {
    return {
      gradient: "from-amber-400 via-orange-400 to-yellow-300",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="12"
            fill="currentColor"
            className="text-yellow-100"
          />
          <g
            className="animate-spin-slow"
            style={{ transformOrigin: "32px 32px" }}
          >
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="32"
                y1="8"
                x2="32"
                y2="14"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-yellow-100"
                transform={`rotate(${i * 45} 32 32)`}
              />
            ))}
          </g>
        </svg>
      ),
      textColor: "text-amber-900",
      accentColor: "bg-amber-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    };
  }

  // Partly cloudy / Cloudy
  if (
    code === 1003 ||
    code === 1006 ||
    code === 1009 ||
    text.includes("cloudy") ||
    text.includes("overcast")
  ) {
    return {
      gradient: "from-blue-400 via-slate-400 to-gray-300",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <path
            d="M16 36a12 12 0 1 1 24 0h16a8 8 0 1 1-8-8 10 10 0 1 0-20 0 12 12 0 0 1-12 8z"
            fill="currentColor"
            className="text-slate-100"
          />
          <circle
            cx="24"
            cy="24"
            r="8"
            fill="currentColor"
            className="text-yellow-100 opacity-60"
          />
        </svg>
      ),
      textColor: "text-slate-800",
      accentColor: "bg-slate-500",
      bgColor: "bg-gradient-to-br from-slate-50 to-gray-100",
    };
  }

  // Rainy / Drizzle
  if (
    (code >= 1063 && code <= 1087) ||
    (code >= 1150 && code <= 1207) ||
    (code >= 1240 && code <= 1252) ||
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower")
  ) {
    return {
      gradient: "from-blue-600 via-indigo-500 to-blue-400",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <path
            d="M20 28a12 12 0 1 1 24 0h12a6 6 0 1 1-6-6 8 8 0 1 0-16 0 12 12 0 0 1-14 6z"
            fill="currentColor"
            className="text-blue-100"
          />
          <g className="animate-pulse">
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                x1={24 + i * 8}
                y1="40"
                x2={22 + i * 8}
                y2="48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-blue-200"
              />
            ))}
          </g>
        </svg>
      ),
      textColor: "text-blue-950",
      accentColor: "bg-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    };
  }

  // Snow
  if (
    (code >= 1210 && code <= 1237) ||
    (code >= 1255 && code <= 1264) ||
    text.includes("snow") ||
    text.includes("sleet") ||
    text.includes("ice")
  ) {
    return {
      gradient: "from-cyan-300 via-sky-300 to-white",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <path
            d="M18 30a12 12 0 1 1 24 0h14a6 6 0 1 1-6-6 8 8 0 1 0-16 0 12 12 0 0 1-16 6z"
            fill="currentColor"
            className="text-sky-100"
          />
          <g className="animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={20 + i * 8}
                cy="44"
                r="2"
                fill="currentColor"
                className="text-white"
              />
            ))}
          </g>
        </svg>
      ),
      textColor: "text-cyan-900",
      accentColor: "bg-cyan-500",
      bgColor: "bg-gradient-to-br from-cyan-50 to-sky-100",
    };
  }

  // Thunderstorm
  if (
    (code >= 1273 && code <= 1282) ||
    text.includes("thunder") ||
    text.includes("storm")
  ) {
    return {
      gradient: "from-purple-600 via-violet-500 to-indigo-500",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <path
            d="M16 32a12 12 0 1 1 24 0h16a8 8 0 1 1-8-8 10 10 0 1 0-20 0 12 12 0 0 1-12 8z"
            fill="currentColor"
            className="text-purple-200"
          />
          <path
            d="M30 38l-6 10h6l-4 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-300 animate-pulse"
          />
        </svg>
      ),
      textColor: "text-purple-950",
      accentColor: "bg-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-100",
    };
  }

  // Fog / Mist
  if (
    (code >= 1030 && code <= 1063) ||
    text.includes("fog") ||
    text.includes("mist")
  ) {
    return {
      gradient: "from-stone-400 via-gray-400 to-slate-400",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
          <path
            d="M8 24h48M12 32h40M16 40h32M20 48h24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-stone-200"
            opacity="0.8"
          />
          <circle
            cx="48"
            cy="20"
            r="8"
            fill="currentColor"
            className="text-stone-100"
            opacity="0.4"
          />
        </svg>
      ),
      textColor: "text-stone-800",
      accentColor: "bg-stone-500",
      bgColor: "bg-gradient-to-br from-stone-50 to-gray-100",
    };
  }

  // Default
  return {
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <circle
          cx="32"
          cy="32"
          r="14"
          fill="currentColor"
          className="text-blue-100"
        />
      </svg>
    ),
    textColor: "text-blue-900",
    accentColor: "bg-blue-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
  };
};

const formatTime = (localtime: string): string => {
  const date = new Date(localtime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (localtime: string): string => {
  const date = new Date(localtime);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export default function WeatherCard({ data }: WeatherCardProps) {
  const theme = getWeatherTheme(
    data.current.condition.text,
    data.current.condition.code,
  );
  const { location, current } = data;

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md ${theme.bgColor} border border-white/20 animate-fade-in max-w-lg`}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-15`}
      />

      {/* Content */}
      <div className="relative p-4">
        {/* Header - Location & Time */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`text-lg font-bold ${theme.textColor}`}>
              {location.name}
            </h3>
            <p className="text-xs opacity-70 font-medium">{location.country}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-light ${theme.textColor}`}>
              {formatTime(location.localtime)}
            </p>
            <p className="text-xs opacity-60 font-medium">
              {formatDate(location.localtime)}
            </p>
          </div>
        </div>

        {/* Main Weather Display */}
        <div className="flex items-center justify-between">
          {/* Temperature */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${theme.accentColor} bg-opacity-20`}
            >
              <div className="w-10 h-10">{theme.icon}</div>
            </div>
            <div>
              <p
                className={`text-3xl font-bold ${theme.textColor} tracking-tight`}
              >
                {Math.round(current.temp_c)}°
              </p>
              <p
                className={`text-sm font-medium opacity-80 ${theme.textColor}`}
              >
                {current.condition.text}
              </p>
            </div>
          </div>

          {/* Weather Badge */}
          <div
            className={`px-3 py-1 rounded-full ${theme.accentColor} bg-opacity-90 text-white font-semibold text-xs shadow-sm`}
          >
            Live
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-3 pt-2 border-t border-black/10">
          <div className="flex items-center gap-2 text-xs opacity-60">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Updated now</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-white/10 blur-lg" />
    </div>
  );
}
