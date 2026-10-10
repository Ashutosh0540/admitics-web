import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const locales = ["en", "hi", "te", "ta"];
const catalogs = Object.fromEntries(await Promise.all(locales.map(async locale => [
  locale,
  JSON.parse(await readFile(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8")),
])));

function flatten(value, prefix = "", output = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") output.set(path, child);
    else if (Array.isArray(child)) child.forEach((item, index) => flatten(item, `${path}.${index}`, output));
    else flatten(child, path, output);
  }
  return output;
}
const keys = Object.fromEntries(locales.map(locale => [locale, flatten(catalogs[locale])]));
const placeholders = value => [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();

test("translation catalogs have identical key paths", () => {
  const expected = [...keys.en.keys()].sort();
  for (const locale of locales.slice(1)) {
    assert.deepEqual([...keys[locale].keys()].sort(), expected, `${locale} catalog keys differ from English`);
  }
});

test("translated strings retain the English interpolation placeholders", () => {
  for (const [key, english] of keys.en) {
    for (const locale of locales.slice(1)) {
      assert.deepEqual(placeholders(keys[locale].get(key)), placeholders(english), `${locale}.${key} placeholders differ`);
    }
  }
});

test("English password label is correctly spelled", () => {
  assert.equal(keys.en.get("auth.password"), "Password");
});
