import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "admitics:preview:identity",
      JSON.stringify({
        id: "preview:staging@example.test",
        email: "staging@example.test",
        name: "Staging Student",
        createdAt: new Date().toISOString(),
      }),
    );
  });
});

test("disabled AI saves the question without a generated reply or responding status", async ({
  page,
}) => {
  await page.goto("/chat");
  await expect(
    page
      .getByRole("note")
      .filter({ hasText: "AI replies are currently disabled" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add context" })).toHaveCount(
    0,
  );

  await page
    .getByRole("textbox", { name: "Your question for Admitics" })
    .fill("Can I save this staging question?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page
      .locator("div[role='status']")
      .filter({ hasText: "Saving your question…" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Your question" }),
  ).toContainText("Can I save this staging question?");
  await expect(
    page.getByRole("article", { name: "Admitics response" }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Your question was saved. AI replies are disabled" }),
  ).toBeVisible();
  await expect(page.getByText("Admitics is responding")).toHaveCount(0);
  await expect(page.getByText("Thinking through your next step")).toHaveCount(
    0,
  );
});

test("dashboard keeps identity and conversation history while optional cards are disabled", async ({
  page,
}) => {
  await page.goto("/chat");
  await page
    .getByRole("textbox", { name: "Your question for Admitics" })
    .fill("A question for the dashboard history");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Your question was saved." }),
  ).toBeVisible();

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Hello, Staging." }),
  ).toBeVisible();
  await expect(page.getByText("Recent conversations")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "A question for the dashboard history",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your documents" }),
  ).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Your usage" })).toHaveCount(
    0,
  );
});

test("disabled document features show a notice without upload controls", async ({
  page,
}) => {
  await page.goto("/chat");
  await expect(
    page
      .getByRole("note")
      .filter({ hasText: "Document features are unavailable" }),
  ).toBeVisible();
  await page.goto("/documents");
  await expect(
    page.getByRole("heading", { name: "Your documents, in the picture." }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("note")
      .filter({ hasText: "Document features are unavailable" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Choose a file" })).toHaveCount(
    0,
  );
  await expect(page.locator("input[type=file]")).toHaveCount(0);
});

test("Settings preserves account controls without requesting or showing usage", async ({
  page,
}) => {
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Account settings." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign-in & security" }),
  ).toBeVisible();
  await expect(page.getByText("Checking your usage…")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Your usage" })).toHaveCount(
    0,
  );
});

test("document processing disabled still permits uploads", async ({ page }) => {
  test.skip(
    process.env.STAGING_TEST_PROFILE !== "processing",
    "requires a build with documents enabled and document processing disabled",
  );
  await page.goto("/documents");
  await expect(
    page.getByRole("button", { name: "Choose a file" }),
  ).toBeVisible();
  const file = page.locator("input[type=file]");
  await expect(file).toBeAttached();
  await file.setInputFiles({
    name: "staging-notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("A staging upload used to verify disabled processing."),
  });
  await expect(
    page.getByText(
      "Uploads are available, but document processing is disabled in this staging demo.",
    ),
  ).toBeVisible();
  await expect(page.getByText("staging-notes.txt")).toBeVisible();
});
