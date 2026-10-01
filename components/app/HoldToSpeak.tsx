"use client";

import type { PointerEvent } from "react";
import { useRef } from "react";
import { APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { useVoiceInput } from "@/lib/speech";
import { MicIcon, StopIcon } from "./Icons";

/** Large hold-to-speak control. Pointer down starts; release stops. */
export function HoldToSpeak({
  lang,
  onText,
  size = "hero",
}: {
  lang: LanguageCode;
  onText: (text: string) => void;
  size?: "hero" | "bar";
}) {
  const a = APP[lang];
  const voice = useVoiceInput(lang, onText);
  const holding = useRef(false);

  if (!voice.supported) return null;

  const recording = voice.state === "recording" || voice.state === "transcribing";
  const note =
    voice.state === "error" ? a.ask.micError : voice.state === "blocked" ? a.ask.micBlocked : voice.state === "unavailable" ? a.ask.micError : null;

  function down(e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    holding.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    voice.reset();
    void voice.start();
  }

  function up() {
    if (!holding.current) return;
    holding.current = false;
    voice.stop();
  }

  if (size === "bar") {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onPointerDown={down}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={() => holding.current && up()}
          disabled={voice.state === "transcribing"}
          aria-label={recording ? a.ask.micStop : a.ask.micStart}
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-md text-white ${
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
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={() => holding.current && up()}
        disabled={voice.state === "transcribing"}
        aria-label={recording ? a.ask.micStop : a.ask.micStart}
        className={`grid h-36 w-36 place-items-center rounded-full text-white shadow-none transition-transform active:scale-[0.98] ${
          recording ? "bg-red-600" : "bg-pine-800"
        } disabled:opacity-50`}
        style={voice.state === "recording" ? { animation: "pulse-ring 1.2s ease-out infinite" } : undefined}
      >
        {recording ? <StopIcon size={40} /> : <MicIcon size={48} />}
      </button>
      <p className="text-center text-[17px] font-semibold text-pine-950">
        {voice.state === "transcribing" ? a.ask.transcribing : recording ? a.ask.micStop : a.home.holdToSpeak}
      </p>
      {note && <p role="alert" className="max-w-xs text-center text-[14px] text-amber-900">{note}</p>}
    </div>
  );
}
