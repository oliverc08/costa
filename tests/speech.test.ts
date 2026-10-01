import { describe, expect, it } from "vitest";
import {
  BROWSER_STT,
  hasBrowserSpeech,
  isAppleWebKit,
  mustUseCloudStt,
  pickVoice,
  scoreVoice,
  shouldFallbackToCloudStt,
} from "@/lib/speech";
import { LANGUAGE_CODES } from "@/lib/languages";
import { PENDING_VOICE_KEY } from "@/components/app/VoiceHome";

function voice(partial: Partial<SpeechSynthesisVoice> & Pick<SpeechSynthesisVoice, "name" | "lang">): SpeechSynthesisVoice {
  return {
    default: false,
    localService: true,
    voiceURI: partial.name,
    ...partial,
  } as SpeechSynthesisVoice;
}

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

  it("detects Apple WebKit / iOS for one-shot recognition settings", () => {
    expect(
      isAppleWebKit(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
    expect(
      isAppleWebKit(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      ),
    ).toBe(true);
    expect(
      isAppleWebKit(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });

  it("forces cloud STT only on Firefox", () => {
    expect(mustUseCloudStt("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0")).toBe(true);
    expect(
      mustUseCloudStt(
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(false);
  });

  it("falls back to recording on network / audio-capture for every browser", () => {
    const iphone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(shouldFallbackToCloudStt(iphone, "network")).toBe(true);
    expect(shouldFallbackToCloudStt(iphone, "no-speech")).toBe(false);
    expect(
      shouldFallbackToCloudStt(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "network",
      ),
    ).toBe(true);
  });

  it("keeps a stable home→ask voice handoff key", () => {
    expect(PENDING_VOICE_KEY).toBe("costa_pending_voice");
  });
});

describe("read-aloud voice picking", () => {
  it("prefers neural / Samantha-style English over compact novelty voices", () => {
    const voices = [
      voice({ name: "Bad News", lang: "en-US" }),
      voice({ name: "Samantha", lang: "en-US", default: true }),
      voice({ name: "Google US English", lang: "en-US" }),
      voice({ name: "Microsoft David Desktop", lang: "en-US" }),
    ];
    expect(pickVoice("en", voices)?.name).toBe("Samantha");
    expect(scoreVoice(voices[1]!, "en")).toBeGreaterThan(scoreVoice(voices[0]!, "en"));
    expect(scoreVoice(voices[2]!, "en")).toBeGreaterThan(scoreVoice(voices[3]!, "en"));
  });

  it("returns null when no voice matches the language", () => {
    const voices = [voice({ name: "Samantha", lang: "en-US" })];
    expect(pickVoice("vi", voices)).toBeNull();
  });
});
