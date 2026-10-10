import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import te from "@/messages/te.json";
import ta from "@/messages/ta.json";

export const locales = ["en", "hi", "te", "ta"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const languageNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు",
  ta: "தமிழ்",
};

type Paths<T> = T extends string
  ? never
  : T extends readonly (infer Item)[]
    ? `${number}.${Paths<Item>}`
    : {
        [K in keyof T & string]: T[K] extends string
          ? K
          : `${K}.${Paths<T[K]>}`;
      }[keyof T & string];
export type TranslationKey = Paths<typeof en>;
export const catalogs = { en, hi, te, ta };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}
export function readPath(source: unknown, path: string): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (current, part) =>
        current && typeof current === "object"
          ? (current as Record<string, unknown>)[part]
          : undefined,
      source,
    );
  return typeof value === "string" ? value : undefined;
}
export function translate(
  locale: Locale,
  key: TranslationKey,
  variables?: Record<string, string | number>,
): string {
  const template = readPath(catalogs[locale], key) ?? readPath(en, key) ?? key;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    String(variables?.[name] ?? `{{${name}}}`),
  );
}
