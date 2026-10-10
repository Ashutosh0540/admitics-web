"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  defaultLocale,
  languageNames,
  translate,
  type Locale,
} from "./i18n/messages";
import {
  getLocaleSnapshot,
  setLocalePreference,
  subscribeLocale,
} from "./i18n/preference";
export {
  locales,
  translate,
  type Locale,
  type TranslationKey,
} from "./i18n/messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    key: Parameters<typeof translate>[1],
    variables?: Record<string, string | number>,
  ) => string;
  languageNames: typeof languageNames;
};
const I18nContext = createContext<I18nContextValue | null>(null);
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => defaultLocale,
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }, [locale]);
  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocalePreference,
      t: translate.bind(null, locale),
      languageNames,
    }),
    [locale],
  );
  return <I18nContext value={value}>{children}</I18nContext>;
}
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside LocaleProvider");
  return context;
}
export function useTranslation() {
  return useI18n().t;
}
