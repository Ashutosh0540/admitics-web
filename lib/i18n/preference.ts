import { defaultLocale, isLocale, type Locale } from "./messages";

export const localeStorageKey = "admitics:locale";
let memoryLocale: Locale = defaultLocale;
export function getLocaleSnapshot(): Locale {
  try {
    const stored = window.localStorage.getItem(localeStorageKey);
    if (isLocale(stored)) memoryLocale = stored;
  } catch {
    /* Keep the preference for this visit when site storage is disabled. */
  }
  return memoryLocale;
}
export function setLocalePreference(locale: Locale) {
  memoryLocale = locale;
  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    /* In-memory fallback. */
  }
  window.dispatchEvent(new Event("admitics:locale"));
}
export function subscribeLocale(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === localeStorageKey || event.key === null) {
      memoryLocale = isLocale(event.newValue) ? event.newValue : defaultLocale;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("admitics:locale", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("admitics:locale", onChange);
  };
}
