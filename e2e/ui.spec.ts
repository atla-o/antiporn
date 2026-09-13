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

test("restriction lock requires LOCK, persists through the lock API", async ({ page, request }) => {
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
  await expect(page.getByTestId("lock-sync")).toHaveText(/saved|local/, { timeout: 15_000 });

  const profileId = await page.evaluate(() => localStorage.getItem("antiporn.v1.profileId"));
  expect(profileId).toBeTruthy();
  const remote = await request.get(`/api/locks/${profileId}`);
  expect(remote.ok()).toBeTruthy();
  const body = (await remote.json()) as { state?: { restriction?: { active?: boolean } } };
  expect(body.state?.restriction?.active).toBeTruthy();

  await page.evaluate(async (id) => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase("antiporn");
      req.onsuccess = () => resolve(null);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    });
    localStorage.setItem("antiporn.v1.profileId", id as string);
  }, profileId);
  await page.reload();
  await expect(page.getByTestId("active-lock")).toBeVisible();
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
    "/api/distro/antiporn-extension.zip",
  );
  await expect(page.getByTestId("download-install-sh")).toHaveAttribute("href", "/api/distro/install.sh");
  await expect(page.getByTestId("download-website-html")).toHaveAttribute("href", "/api/distro/website.html");
  await expect(page.getByTestId("open-embed")).toHaveAttribute("href", "/embed");
  await expect(page.getByRole("link", { name: /github\.com\/atla-o\/antiporn/ })).toBeVisible();
  await expect(page.getByTestId("install-assets")).toContainText(/ready from|Checking install/);

  await page.getByRole("tab", { name: "Preview" }).click();
  await expect(page.getByRole("heading", { name: "How to use" })).toBeVisible();
  await expect(page.locator('iframe[title="Antiporn preview"]')).toBeVisible();

  await page.getByRole("tab", { name: "Extension" }).click();
  await expect(page.getByRole("link", { name: "Download zip" })).toHaveAttribute(
    "href",
    "/api/distro/antiporn-extension.zip",
  );
});

test("website html, embed, and distro API", async ({ page, request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  const info = (await health.json()) as { project?: string; bucket?: string };
  expect(info.project).toBe("devo-holding");
  expect(info.bucket).toBe("antiporn-releases");

  const zip = await request.get("/api/distro/antiporn-extension.zip");
  expect(zip.ok()).toBeTruthy();
  expect((await zip.body()).byteLength).toBeGreaterThan(100);

  const installer = await request.get("/api/distro/install.sh");
  expect(installer.ok()).toBeTruthy();
  expect(await installer.text()).toContain("antiporn-extension.zip");

  const pageFile = await request.get("/api/distro/website.html");
  expect(pageFile.ok()).toBeTruthy();
  expect(await pageFile.text()).toContain("Antiporn");

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
