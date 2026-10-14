import { expect, test } from "@playwright/test";
import {
  completeAuthCallback,
  createCallbackCompleter,
} from "@/lib/auth/callback";

test("PKCE callback keeps flow parameters until exchange and validates destination", async () => {
  const url = new URL(
    "https://app.admitics.org/auth/callback?code=one-time-code&sb_flow_id=flow-1&next=%2Fsettings",
  );
  let cleared = false;
  const destination = await completeAuthCallback(
    url,
    async (code) => {
      expect(code).toBe("one-time-code");
      expect(cleared).toBe(false);
      expect(url.searchParams.get("sb_flow_id")).toBe("flow-1");
    },
    () => {
      cleared = true;
    },
  );

  expect(destination).toBe("/settings");
  expect(cleared).toBe(true);
});

test("PKCE callback sends password recovery to the validated reset page", async () => {
  const destination = await completeAuthCallback(
    new URL(
      "https://app.admitics.org/auth/callback?code=recovery-code&next=%2Freset-password",
    ),
    async () => undefined,
    () => {},
  );

  expect(destination).toBe("/reset-password");
});

test("OAuth provider errors are reported safely without attempting an exchange", async () => {
  let exchanged = false;
  let cleared = false;

  await expect(
    completeAuthCallback(
      new URL(
        "https://app.admitics.org/auth/callback?error=access_denied&error_description=private+provider+detail",
      ),
      async () => {
        exchanged = true;
      },
      () => {
        cleared = true;
      },
    ),
  ).rejects.toThrow("Sign-in was cancelled");

  expect(exchanged).toBe(false);
  expect(cleared).toBe(true);
});

test("missing callback codes fail clearly without trusting an existing session", async () => {
  let exchanged = false;
  let cleared = false;

  await expect(
    completeAuthCallback(
      new URL("https://app.admitics.org/auth/callback?next=%2Fdashboard"),
      async () => {
        exchanged = true;
      },
      () => {
        cleared = true;
      },
    ),
  ).rejects.toThrow("missing its authorization code");

  expect(exchanged).toBe(false);
  expect(cleared).toBe(true);
});

test("exchange failures remain failures and callback URLs are cleaned afterward", async () => {
  let cleared = false;

  await expect(
    completeAuthCallback(
      new URL("https://app.admitics.org/auth/callback?code=invalid-code"),
      async () => {
        throw new Error("Code exchange failed");
      },
      () => {
        cleared = true;
      },
    ),
  ).rejects.toThrow("Code exchange failed");

  expect(cleared).toBe(true);
});

test("duplicate in-flight exchanges share work, while later attempts can retry", async () => {
  let calls = 0;
  let rejectFirst: ((reason: Error) => void) | undefined;
  const complete = createCallbackCompleter((code: string) => {
    calls += 1;
    if (code === "first-code")
      return new Promise<string>((_resolve, reject) => {
        rejectFirst = reject;
      });
    return Promise.resolve("authenticated user");
  });

  const first = complete("first-code");
  const duplicate = complete("first-code");
  expect(duplicate).toBe(first);
  await Promise.resolve();
  expect(calls).toBe(1);

  rejectFirst?.(new Error("First exchange failed"));
  await expect(first).rejects.toThrow("First exchange failed");
  await expect(complete("second-code")).resolves.toBe("authenticated user");
  expect(calls).toBe(2);
});
