import { describe, expect, it } from "vitest";
import { BROWSER_STT, hasBrowserSpeech } from "@/lib/speech";
import { LANGUAGE_CODES } from "@/lib/languages";

describe("browser speech-to-text", () => {
  it("maps every UI language to a BCP-47 recognition tag", () => {
    for (const code of LANGUAGE_CODES) {
      expect(BROWSER_STT[code]).toMatch(/^[a-z]{2,3}(-[A-Z]{2})?$/);
    }
    expect(BROWSER_STT.zh).toBe("zh-CN");
    expect(BROWSER_STT.tl).toBe("fil-PH");
  });

  it("reports no SpeechRecognition in the Node test environment", () => {
    expect(hasBrowserSpeech()).toBe(false);
  });
});
