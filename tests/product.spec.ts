import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
async function a11y(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}
async function history(page: Page) {
  const trigger = page.getByRole("button", {
    name: "Open conversation history",
  });
  if (await trigger.isVisible()) {
    await trigger.click();
    return page.getByRole("dialog", { name: "Your workspace" });
  }
  return page.getByRole("complementary", { name: "Conversation history" });
}
async function ask(page: Page, question: string) {
  await page
    .getByRole("textbox", { name: "Your question for Admitics" })
    .fill(question);
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByRole("button", { name: "Copy response", exact: true }).last(),
  ).toBeVisible();
}

test("landing, metadata and keyboard-accessible navigation", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your next chapter",
  );
  await expect(page).toHaveTitle(/Admitics/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https?:\/\//,
  );
  await noOverflow(page);
  await a11y(page);
  const finalCta = page
    .getByRole("main")
    .locator("section")
    .last()
    .getByRole("link", { name: "Ask Admitics", exact: true });
  await finalCta.scrollIntoViewIfNeeded();
  expect(await finalCta.evaluate((el) => getComputedStyle(el).color)).toBe(
    "rgb(31, 85, 68)",
  );
  await a11y(page);
  await page.screenshot({
    path: info.outputPath("homepage.png"),
    fullPage: true,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  if (info.project.name === "mobile") {
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await a11y(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Exams", exact: true })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Exams", exact: true })
      .click();
  await expect(page).toHaveURL(/\/exams$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "right exam",
  );
});

test("public routes and footer links resolve", async ({ page, request }) => {
  for (const path of [
    "/admissions",
    "/exams",
    "/colleges",
    "/courses",
    "/scholarships",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/exams/jee-main",
    "/colleges/iit-bombay",
    "/courses/btech",
    "/scholarships/inspire",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 }),
    ).toBeVisible();
    await noOverflow(page);
  }
  await page.goto("/");
  const links = await page
    .locator('footer a[href^="/"]')
    .evaluateAll((elements) => [
      ...new Set(elements.map((el) => el.getAttribute("href")!)),
    ]);
  for (const href of links)
    expect((await request.get(href)).ok(), href).toBe(true);
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  expect((await request.get("/opengraph-image")).ok()).toBe(true);
});

test("content search, filtering, details and advisor handoff", async ({
  page,
}) => {
  await page.goto("/exams");
  await page
    .getByRole("searchbox", { name: "Search exams" })
    .fill("zz-no-match");
  await expect(
    page.getByRole("heading", { name: "No matches just yet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Filter by area").selectOption("Engineering");
  await expect(page.getByRole("article")).toHaveCount(1);
  await a11y(page);
  await page.getByRole("link", { name: "Explore JEE Main" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("JEE Main");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Ask Admitics", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Your question for Admitics" }),
  ).toHaveValue(/JEE Main/);
});

test("chat streams, persists, presents honest sources and supports history actions", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/chat");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What’s on your mind",
  );
  await a11y(page);
  await ask(page, "What scholarships can I apply for?");
  await expect(
    page.getByText("REFERENCE LINKS · PREVIEW, NOT RETRIEVED EVIDENCE"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /National Scholarship Portal/ }),
  ).toHaveAttribute("href", "https://scholarships.gov.in/");
  await page
    .getByRole("button", { name: "Copy response", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Response copied" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Preview response",
  );
  await page
    .getByRole("button", { name: "Helpful response", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Helpful response", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await noOverflow(page);
  await a11y(page);
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Your question" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Copy response", exact: true }),
  ).toBeVisible();
  const sidebar = await history(page);
  await sidebar.getByRole("button", { name: /^Rename / }).click();
  await page.getByLabel("Conversation name").fill("Scholarship plan");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("dialog", { name: "Name this conversation" }),
  ).not.toBeVisible();
  const visibleHistory = page.getByRole("dialog", { name: "Your workspace" });
  const currentSidebar = (await visibleHistory.isVisible())
    ? visibleHistory
    : page.getByRole("complementary", { name: "Conversation history" });
  await currentSidebar
    .getByRole("button", { name: "Delete Scholarship plan" })
    .click();
  await page
    .getByRole("dialog", { name: "Delete this conversation?" })
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What’s on your mind",
  );
});

test("failed chat retries without duplicating the saved question", async ({
  page,
}) => {
  await page.goto("/chat");
  await page
    .getByRole("textbox", { name: "Your question for Admitics" })
    .fill("Help me choose an exam [demo:error]");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Example connection failure",
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("button", { name: "Copy response", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Your question" }),
  ).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Your question" }),
  ).toHaveCount(1);
});

test("stream cancellation offers a controlled retry", async ({ page }) => {
  await page.goto("/chat");
  await page
    .getByRole("textbox", { name: "Your question for Admitics" })
    .fill("What can I study next?");
  await page.getByRole("button", { name: "Send question" }).click();
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect(
    page.getByRole("button", { name: "Retry response" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry response" }).click();
  await expect(
    page.getByRole("button", { name: "Copy response", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Your question" }),
  ).toHaveCount(1);
});

test("document validation, lifecycle, context and deletion", async ({
  page,
}) => {
  await page.goto("/documents");
  await expect(
    page.getByRole("button", { name: "Choose a file" }),
  ).toBeVisible();
  await a11y(page);
  await page.locator('input[type="file"]').setInputFiles({
    name: "unsupported.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("test"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Choose one of these file types",
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: "notice.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Example admission notice"),
  });
  const readyFile = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: "notice.txt" }) });
  await expect(readyFile.getByText("Ready", { exact: true })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "fail.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Example failure"),
  });
  const failedFile = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: "fail.txt" }) });
  await expect(failedFile.getByText("Failed", { exact: true })).toBeVisible();
  await noOverflow(page);
  await readyFile
    .getByRole("link", { name: "Ask about this document" })
    .click();
  await expect(page.getByText("notice.txt", { exact: true })).toBeVisible();
  await ask(page, "What does this document say?");
  await expect(
    page.getByRole("article", { name: "Admitics response" }),
  ).toContainText("It has not read, extracted, or analyzed your document");
  await page.goto("/documents");
  await page.getByRole("button", { name: "Delete notice.txt" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "notice.txt" })).toHaveCount(
    0,
  );
});

test("preview signup, profile, logout, login and account isolation", async ({
  page,
}) => {
  await page.goto("/chat");
  await ask(page, "My guest question");
  await page.goto("/signup");
  await a11y(page);
  await page.getByLabel("Your name", { exact: true }).fill("Mira Student");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("mira@example.com");
  await page.getByLabel("Password", { exact: true }).fill("preview-only");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue in preview" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hello, Mira.",
  );
  await expect(
    page.getByRole("heading", { name: "A conversation waiting to happen" }),
  ).toBeVisible();
  await noOverflow(page);
  await a11y(page);
  await page.goto("/settings");
  await page.getByLabel("Display name").fill("Mira Explorer");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(
    page.getByText("Your display name has been updated."),
  ).toBeVisible();
  await a11y(page);
  await page
    .locator("main")
    .getByRole("button", { name: "Log out", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/login");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("mira@example.com");
  await page.getByLabel("Password", { exact: true }).fill("preview-only");
  await page.getByRole("button", { name: "Continue in preview" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hello, Mira.",
  );
});

test("authentication recovery and Google expose configuration honestly", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "public Supabase configuration",
  );
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let’s get you back in.",
  );
  await page
    .getByLabel("Email address", { exact: true })
    .fill("explorer@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "isn't sent in preview mode",
  );
  await a11y(page);
  await page.goto("/reset-password");
  await expect(
    page.getByRole("button", { name: "Update password" }),
  ).toBeVisible();
});

test("narrow phones, tablets and laptops keep product surfaces usable", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/chat", "/dashboard", "/documents", "/signup"]) {
      await page.goto(path);
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
      if (path === "/documents")
        await expect(
          main.getByRole("button", { name: "Choose a file" }),
        ).toBeVisible();
      await noOverflow(page);
      if (path === "/chat") {
        await expect(
          main.getByRole("textbox", { name: "Your question for Admitics" }),
        ).toBeVisible();
        expect(
          await main
            .getByRole("textbox")
            .evaluate(
              (el) => el.getBoundingClientRect().bottom <= window.innerHeight,
            ),
        ).toBe(true);
      }
    }
  }
});

test("language selector switches the interface and persists across refresh", async ({
  page,
}, info) => {
  await page.goto("/");
  const selectLanguage = async (name: string) => {
    if (info.project.name === "mobile") {
      const trigger = page.locator("header > div > button").last();
      if (!(await page.getByRole("dialog").isVisible())) await trigger.click();
      await page
        .getByRole("dialog")
        .locator('button[aria-haspopup="menu"]')
        .first()
        .click();
    } else {
      await page.locator('button[aria-haspopup="menu"]').first().click();
    }
    await page.getByRole("menuitemradio", { name }).click();
  };
  await selectLanguage("हिन्दी");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "आपका अगला अध्याय",
  );
  await page.reload();
  if (info.project.name === "mobile") {
    await page.locator("header > div > button").last().click();
  }
  await expect(
    info.project.name === "mobile"
      ? page.getByRole("dialog").getByRole("link", { name: "खोजें" })
      : page
          .getByRole("navigation", { name: "मुख्य नेविगेशन" })
          .getByRole("link", { name: "खोजें" }),
  ).toBeVisible();

  for (const [language, heading] of [
    ["తెలుగు", "మీ తదుపరి అధ్యాయం"],
    ["தமிழ்", "உங்கள் அடுத்த அத்தியாயம்"],
    ["English", "Your next chapter"],
  ]) {
    await selectLanguage(language);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading,
    );
  }
});

test("changing language during a chat request preserves its conversation and URL", async ({ page }) => {
  await page.goto("/chat");
  const composer = page.getByRole("textbox", { name: "Your question for Admitics" });
  await composer.fill("Help me choose a next step while I change languages.");
  await page.getByRole("button", { name: "Send question" }).click();
  await page.getByRole("button", { name: "Choose language" }).click();
  await page.getByRole("menuitemradio", { name: "हिन्दी" }).click();
  await expect(page).toHaveURL(/\/chat\?id=/);
  const conversationUrl = page.url();
  await expect(page.getByRole("article", { name: "Admitics का जवाब" })).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(conversationUrl);
  await expect(page.locator("article").filter({ hasText: "Help me choose a next step" })).toBeVisible();
});
