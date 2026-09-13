import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("home loads filter UI", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Antiporn").first()).toBeVisible();
  await expect(page.getByRole("tab", { name: "Filter" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Engage filter" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nudity squares" })).toBeVisible();
  await expect(page.getByTestId("filter-empty")).toBeVisible();
  await expect(page.getByTestId("nudity-empty")).toBeVisible();
});

test("skin fixture draws overlay squares", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("generate-skin-fixture").click();
  const stats = page.getByTestId("nudity-stats");
  await expect(stats).toContainText(/square/);
  await expect(stats).not.toContainText("0 squares");
  const canvas = page.getByTestId("nudity-canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box && box.height > 40).toBeTruthy();
  await expect(page.getByTestId("nudity-success")).toBeVisible();
});

test("preview rejects a non-image file", async ({ page }) => {
  await page.goto("/");
  await page.locator("#nudity-file").setInputFiles({
    name: "note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByTestId("nudity-error")).toContainText("Use an image file.");
});

test("restriction lock requires LOCK and then shows countdown", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.getByTestId("engage-restriction").click();
  await expect(page.getByText("Type LOCK to confirm.")).toBeVisible();
  await expect(page.getByTestId("lock-confirm-submit")).toBeDisabled();
  await page.getByTestId("lock-confirm-input").fill("LOCK");
  await page.getByTestId("lock-confirm-submit").click();
  await expect(page.getByTestId("active-lock")).toBeVisible();
  await expect(page.getByText("Active filter")).toBeVisible();
  await expect(page.getByText("Severity is frozen while a filter or vault is active.")).toBeVisible();
  await expect(page.getByTestId("filter-success")).toBeVisible();
});

test("tabs: vault and install (preview + extension nested)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Time vault" }).click();
  await expect(page.getByText("Relapse lock")).toBeVisible();
  await expect(page.getByTestId("vault-empty")).toBeVisible();
  await page.getByTestId("seal-vault").click();
  await expect(page.getByText("There is no stop button.")).toBeVisible();
  await page.getByTestId("vault-confirm-input").fill("VAULT");
  await page.getByTestId("vault-confirm-submit").click();
  await expect(page.getByTestId("active-vault")).toBeVisible();
  await expect(page.getByTestId("vault-success")).toBeVisible();

  await page.getByRole("tab", { name: "Install" }).click();
  await expect(page.getByText("curl -fsSL")).toBeVisible();
  await expect(page.getByTestId("download-extension-zip")).toHaveAttribute(
    "href",
    "/downloads/antiporn-extension.zip",
  );
  await expect(page.getByTestId("download-install-sh")).toHaveAttribute("href", "/install.sh");
  await expect(page.getByTestId("download-website-html")).toHaveAttribute("href", "/website.html");
  await expect(page.getByTestId("open-embed")).toHaveAttribute("href", "/embed");
  await expect(page.getByRole("link", { name: /github\.com\/atla-o\/antiporn/ })).toBeVisible();
  await expect(page.getByTestId("install-assets")).toContainText(/ready on this host|Checking install files/);

  await page.getByRole("tab", { name: "Preview" }).click();
  await expect(page.getByRole("heading", { name: "How to use" })).toBeVisible();
  await expect(page.locator('iframe[title="Antiporn preview"]')).toBeVisible();

  await page.getByRole("tab", { name: "Extension" }).click();
  await expect(page.getByRole("link", { name: "Download zip" })).toHaveAttribute(
    "href",
    "/downloads/antiporn-extension.zip",
  );
});

test("website html and embed routes", async ({ page, request }) => {
  const zip = await request.get("/downloads/antiporn-extension.zip");
  expect(zip.ok()).toBeTruthy();
  expect((await zip.body()).byteLength).toBeGreaterThan(100);

  const installer = await request.get("/install.sh");
  expect(installer.ok()).toBeTruthy();
  expect(await installer.text()).toContain("antiporn-extension.zip");

  await page.goto("/website.html");
  await expect(page.getByRole("heading", { name: "Antiporn" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download extension zip" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download install.sh" })).toBeVisible();
  await expect(page.locator("#app")).toHaveAttribute("src", /\/embed$/);

  await page.goto("/embed");
  await expect(page.getByRole("tab", { name: "Filter" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nudity squares" })).toBeVisible();
});

test("mobile layout keeps tabs usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Install" })).toBeVisible();
  await page.getByRole("tab", { name: "Install" }).click();
  await expect(page.getByRole("heading", { name: "Drag and drop" })).toBeVisible();
  await expect(page.getByTestId("download-extension-zip")).toBeVisible();
});
