"use client";

import type { Weather } from "@/src/core/domain/weather";
import { Tip } from "@/src/shared/ui/Tip";

type FocusHeaderProps = Readonly<{
  todayLabel: string;
  weather: Weather | null;
  weatherIcon: (code: number, isDay: boolean) => string;
  searchOpen: boolean;
  searchQuery: string;
  matchCount: number;
  activeMatch: number;
  onSearchOpen: () => void;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onMoveMatch: (direction: 1 | -1) => void;
  onCloseSearch: () => void;
}>;

export function FocusHeader({
  todayLabel,
  weather,
  weatherIcon,
  searchOpen,
  searchQuery,
  matchCount,
  activeMatch,
  onSearchOpen,
  onSearchChange,
  onSearchKeyDown,
  onMoveMatch,
  onCloseSearch,
}: FocusHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <div className="date-row">
          <p className="eyebrow">{todayLabel}</p>
          {weather && (
            <span
              className="weather"
              title={`Väder i ${weather.location}`}
              aria-label={`Väder i ${weather.location}: ${Math.round(weather.temperature)} grader`}
            >
              {weatherIcon(weather.weatherCode, weather.isDay)}{" "}
              {Math.round(weather.temperature)}°
            </span>
          )}
        </div>
        <h1>
          Hej, Fredrik <span>✦</span>
        </h1>
      </div>
      <div className="top-actions">
        {searchOpen && (
          <>
            <div className="search-nav">
              <button
                type="button"
                onClick={() => onMoveMatch(-1)}
                disabled={!matchCount}
                title="Föregående träff"
                aria-label="Föregående träff"
              >
                ⌃
              </button>
              <button
                type="button"
                onClick={() => onMoveMatch(1)}
                disabled={!matchCount}
                title="Nästa träff"
                aria-label="Nästa träff"
              >
                ⌄
              </button>
            </div>
            <div className="search-box">
              <input
                aria-label="Sök trådar"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Sök trådar…"
              />
              <span className="search-count">
                {matchCount ? activeMatch + 1 : 0}/{matchCount}
              </span>
              <button
                type="button"
                onClick={onCloseSearch}
                aria-label="Stäng sökning"
              >
                ×
              </button>
            </div>
          </>
        )}
        <Tip title={searchOpen ? "Stäng sökning" : "Sök i trådar"}>
          <button
            type="button"
            className="icon-button"
            onClick={onSearchOpen}
            aria-label={searchOpen ? "Stäng sökning" : "Sök i trådar"}
          >
            ⌕
          </button>
        </Tip>
        <Tip title="Profil">
          <span className="avatar" aria-label="Profil">
            F
          </span>
        </Tip>
      </div>
    </header>
  );
}
