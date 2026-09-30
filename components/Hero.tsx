"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroSubtitle, user } from "@/data/mock";
import { ApiError, transcribeAudio } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Hero — the full-bleed greeting and primary search surface.
 *
 * The background is a single CSS gradient plus three blurred circles standing
 * in for cloud and ridge; there is no image asset, so the hero stays crisp at
 * any width and costs no request. Content is centred over the top layer while
 * a white fade at the foot carries it into the dashboard below.
 */
export default function Hero() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  // MediaRecorder is unavailable on older Safari and in insecure contexts.
  const canRecord =
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.mediaDevices?.getUserMedia !== undefined;

  const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;

  // The hero is the general "ask anything" entry point, so a submitted
  // question opens the Internet screen with the query attached. The category
  // tiles lead to the other three, each pre-set to its own mode.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = value.trim();
    if (!question) return;
    router.push(`/internet?q=${encodeURIComponent(question)}`);
  };

  /**
   * Record a short clip, then have the backend transcribe it. Recording is
   * capped so a forgotten mic cannot hold the stream open indefinitely.
   */
  const toggleRecording = async () => {
    setVoiceError(null);

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }

    if (!canRecord) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        // Release the microphone immediately; nothing else needs the stream.
        stream.getTracks().forEach((track) => track.stop());
        setListening(false);

        const mime = recorder.mimeType || "audio/webm";
        const clip = new Blob(chunksRef.current, { type: mime });

        if (clip.size === 0) {
          setVoiceError("Nothing was recorded. Try again.");
          return;
        }

        try {
          const { text } = await transcribeAudio(clip);
          setValue((current) => (current ? `${current} ${text}` : text));
        } catch (error) {
          setVoiceError(
            error instanceof ApiError
              ? error.message
              : "Could not transcribe that clip.",
          );
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setListening(true);

      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 15_000);
    } catch {
      setVoiceError("Microphone access was blocked.");
    }
  };

  return (
    <section className="relative min-h-[440px] overflow-hidden bg-gradient-to-b from-[#E8F0FB] via-[#F4F8FD] to-white">
      {/* Decorative cloud and ridge shapes. Purely atmospheric. */}
      <div
        className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-sauti-blueSoft blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-12 h-72 w-72 rounded-full bg-sauti-purpleSoft blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-56 w-56 rounded-full bg-sauti-orangeSoft blur-3xl"
        aria-hidden="true"
      />

      {/* Fades the gradient into the white page beneath. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sauti-orange to-sauti-blue text-[28px] font-bold text-white"
          aria-hidden="true"
        >
          S
        </div>

        <h1 className="mt-5 text-[42px] font-bold text-sauti-text">
          Hello, {firstName}!
        </h1>
        <p className="mt-2 text-center text-[18px] text-sauti-textMuted">
          {heroSubtitle}
        </p>

        <form
          onSubmit={onSubmit}
          role="search"
          className="mt-8 flex h-16 w-full max-w-[720px] items-center gap-3 rounded-full bg-white px-5 shadow-search"
        >
          <Search size={20} className="shrink-0 text-sauti-textMuted" />

          <Input
            type="search"
            aria-label="Ask Sauti anything"
            placeholder={heroSubtitle}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={cn("flex-1 bg-transparent text-[15px]")}
          />

          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            aria-label={
              listening
                ? "Stop recording"
                : "Ask with your voice by recording a clip"
            }
            aria-pressed={listening}
            disabled={!canRecord}
            onClick={toggleRecording}
            className="shrink-0"
          >
            {listening ? (
              <span className="flex h-4 w-4 items-center justify-center">
                <span className="h-3 w-3 rounded-[2px] bg-sauti-orange" />
              </span>
            ) : (
              <Mic size={20} />
            )}
          </Button>

          <Button
            type="submit"
            variant="default"
            size="icon"
            aria-label="Send question"
            className="shrink-0 rounded-full"
          >
            <Send size={18} />
          </Button>
        </form>

        {listening ? (
          <p className="mt-3 text-[12px] text-sauti-textMuted" role="status">
            Recording… tap the square to stop.
          </p>
        ) : null}

        {voiceError ? (
          <p
            className="mt-3 text-[12px] text-sauti-orange"
            role="alert"
          >
            {voiceError}
          </p>
        ) : null}
      </div>
    </section>
  );
}