"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { locales, useI18n, type Locale } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t, languageNames } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t("language.selectorLabel")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted hover:bg-mint hover:text-brand"
      >
        <Globe size={15} aria-hidden="true" />
        <span>{languageNames[locale]}</span>
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("language.selectorLabel")}
          className="absolute right-0 z-50 mt-2 min-w-36 rounded-xl border border-line bg-white p-1.5 shadow-lg"
        >
          {locales.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={locale === option}
              aria-current={locale === option ? "true" : undefined}
              onClick={() => {
                setLocale(option);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-mint"
            >
              <span>{languageNames[option as Locale]}</span>
              {locale === option && (
                <Check size={14} className="text-brand" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
