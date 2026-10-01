"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useVoiceInput } from "@/lib/speech";
import { app } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { MicIcon, StopIcon } from "./Icons";

const noSelect =
  "select-none [-webkit-touch-callout:none] [-webkit-user-select:none] [user-select:none] touch-manipulation";

/**
 * Tap-to-talk mic. Hold-to-speak was unreliable on phones (selection highlight,
 * pointer leave, race with async permission / SpeechRecognition start).
 */
export function HoldToSpeak({
  lang,
  onText,
  size = "hero",
}: {
  lang: LanguageCode;
  onText: (text: string) => void;
  size?: "hero" | "bar";
}) {
  const a = app(lang);
  const voice = useVoiceInput(lang, onText);

  if (!voice.supported) {
    if (size === "hero") {
      return (
        <Link
          href="/ask"
          className="flex min-h-14 items-center justify-center rounded-md border-2 border-pine-800 bg-white px-6 text-[17px] font-bold text-pine-900 active:bg-pine-50"
        >
          {a.home.orType}
        </Link>
      );
    }
    return null;
  }

  const recording = voice.state === "recording" || voice.state === "transcribing" || voice.state === "loading-model";
  const note =
    voice.state === "error"
      ? a.ask.micError
      : voice.state === "blocked"
        ? a.ask.micBlocked
        : voice.state === "unavailable"
          ? a.ask.micError
          : null;

  function toggle() {
    if (voice.state === "transcribing" || voice.state === "loading-model") return;
    if (recording) {
      voice.stop();
      return;
    }
    voice.reset();
    void voice.start();
  }

  function onContextMenu(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  if (size === "bar") {
    return (
      <div className={`flex flex-col gap-1 ${noSelect}`}>
        <button
          type="button"
          onClick={toggle}
          onContextMenu={onContextMenu}
          disabled={voice.state === "transcribing" || voice.state === "loading-model"}
          aria-pressed={recording}
          aria-label={recording ? a.ask.micStop : a.ask.micStart}
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-md text-white ${noSelect} ${
            recording ? "bg-red-600" : "bg-pine-800 active:bg-pine-900"
          } disabled:opacity-40`}
          style={voice.state === "recording" ? { animation: "pulse-ring 1.2s ease-out infinite" } : undefined}
        >
          {recording ? <StopIcon size={22} /> : <MicIcon size={24} />}
        </button>
        {note && <p className="text-[12px] text-amber-900">{note}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${noSelect}`}>
      <button
        type="button"
        onClick={toggle}
        onContextMenu={onContextMenu}
        disabled={voice.state === "transcribing" || voice.state === "loading-model"}
        aria-pressed={recording}
        aria-label={recording ? a.ask.micStop : a.ask.micStart}
        className={`grid h-36 w-36 place-items-center rounded-full text-white shadow-none transition-transform active:scale-[0.98] ${noSelect} ${
          recording ? "bg-red-600" : "bg-pine-800"
        } disabled:opacity-50`}
        style={voice.state === "recording" ? { animation: "pulse-ring 1.2s ease-out infinite" } : undefined}
      >
        {recording ? <StopIcon size={40} /> : <MicIcon size={48} />}
      </button>
      <p className="text-center text-[17px] font-semibold text-pine-950">
        {voice.state === "loading-model"
          ? a.ask.loadingModel
          : voice.state === "transcribing"
            ? a.ask.transcribing
            : recording
              ? a.ask.micStop
              : a.home.holdToSpeak}
      </p>
      {voice.partial ? (
        <p className="max-w-sm text-center text-[15px] leading-snug text-stone-600">{voice.partial}</p>
      ) : null}
      {note && (
        <p role="alert" className="max-w-xs text-center text-[14px] text-amber-900">
          {note}
        </p>
      )}
    </div>
  );
}
