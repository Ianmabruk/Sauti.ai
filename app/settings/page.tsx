"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/states";
import { API_BASE_URL, health, languages, sautiHealth } from "@/lib/api";
import type { SupportedLanguage } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Settings — preferences and service status.
 *
 * The backend's supported language list is fetched rather than hardcoded, so
 * a language added server-side appears here without a frontend change. The
 * status block is the fastest way to tell a broken connection from a broken
 * model provider.
 */

const LANGUAGE_KEY = "sauti.replyLanguage";

export default function SettingsScreen() {
  const [languages_, setLanguages] = useState<
    Array<{ code: string; name: string; native_name: string; is_active: boolean }> | null
  >(null);
  const [replyLanguage, setReplyLanguage] = useState<SupportedLanguage>("auto");
  const [status, setStatus] = useState<"checking" | "up" | "down">("checking");
  const [engine, setEngine] = useState<{
    engine: string;
    model: string;
    groqReachable: boolean;
    searchConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    if (stored) setReplyLanguage(stored as SupportedLanguage);

    const controller = new AbortController();

    languages(controller.signal)
      .then((data) =>
        setLanguages(data.languages.filter((entry) => entry.is_active)),
      )
      .catch(() => setLanguages([]));

    health(controller.signal)
      .then(() => setStatus("up"))
      .catch(() => setStatus("down"));

    sautiHealth(controller.signal)
      .then((data) => setEngine(data))
      .catch(() => setEngine(null));

    return () => controller.abort();
  }, []);

  const choose = (code: SupportedLanguage) => {
    setReplyLanguage(code);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, code);
    } catch {
      // Storage blocked: the choice applies for this session only.
    }
  };

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-[20px] font-bold text-sauti-text">Settings</h1>

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        {/* ---------------------------------------------- service */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-sauti-text">
            Service status
          </h2>

          <div className="mt-3 flex items-center gap-2">
            {status === "checking" ? (
              <LoadingState label="Checking" />
            ) : status === "up" ? (
              <>
                <Check size={15} className="text-sauti-green" />
                <span className="text-[13px] text-sauti-text">
                  Backend reachable at{" "}
                  <code className="rounded bg-sauti-surface px-1 py-0.5 text-[12px]">
                    {API_BASE_URL}
                  </code>
                </span>
              </>
            ) : (
              <span className="text-[13px] text-sauti-orange">
                Could not reach the backend. Start it with{" "}
                <code className="rounded bg-sauti-surface px-1 py-0.5 text-[12px]">
                  python wsgi.py
                </code>
                .
              </span>
            )}
            {engine ? (
              <div className="mt-3 flex flex-wrap gap-4 border-t border-sauti-border pt-3 text-[12px] text-sauti-textMuted">
                <span>
                  Engine:{" "}
                  <span className="font-medium text-sauti-text">
                    {engine.engine}
                  </span>
                </span>
                <span>Model: {engine.model}</span>
                <span>
                  Model reachable:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      engine.groqReachable ? "text-sauti-green" : "text-sauti-orange",
                    )}
                  >
                    {engine.groqReachable ? "yes" : "no"}
                  </span>
                </span>
                <span>
                  Web research:{" "}
                  <span className="font-medium text-sauti-text">
                    {engine.searchConfigured ? "configured" : "not configured"}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        </Card>

        {/* ---------------------------------------------- language */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-sauti-text">
            Reply language
          </h2>
          <p className="mt-1 text-[13px] text-sauti-textMuted">
            Sauti will try to reply in the language you choose here.
          </p>

          {!languages_ ? (
            <LoadingState label="Loading languages" />
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <LanguagePill
                label="Automatic"
                active={replyLanguage === "auto"}
                onClick={() => choose("auto")}
              />
              {languages_.map((entry) => (
                <LanguagePill
                  key={entry.code}
                  label={entry.native_name || entry.name}
                  active={replyLanguage === entry.code}
                  onClick={() => choose(entry.code as SupportedLanguage)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* ---------------------------------------------- about */}
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-sauti-text">About</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-sauti-textMuted">
            Sauti answers questions, finds marketplace listings and explains
            topics in English, Kiswahili and French. Answers are generated by
            a language model and grounded with sources where web research was
            available.
          </p>
          <p className="mt-3 text-[12px] text-sauti-textFaint">
            This build runs against a live backend. Listings, articles and
            answers shown in the app are not sample data.
          </p>
        </Card>
      </div>
    </div>
  );
}

function LanguagePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      className={cn(
        "h-9 px-4 text-[13px]",
        !active && "font-normal",
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}