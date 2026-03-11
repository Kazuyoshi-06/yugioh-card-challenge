const path = require("path");
const { test, expect } = require("@playwright/test");

const APP_URL = "file:///" + path.resolve(__dirname, "../index.html").replace(/\\/g, "/");

test.describe("Yu-Gi-Oh Card Challenge", () => {
    test("loads with expected UI structure", async ({ page }) => {
        await page.goto(APP_URL);

        await expect(page).toHaveTitle("Yu-Gi-Oh Favorite Cards Challenge");
        await expect(page.locator("#card-grid label[id^='slot-']")).toHaveCount(9);
        await expect(page.locator("#download-btn")).toBeVisible();
        await expect(page.locator("#randomize-btn")).toBeVisible();
    });

    test("rejects invalid upload format", async ({ page }) => {
        await page.goto(APP_URL);

        const input = page.locator("#upload-deck");
        await input.setInputFiles({
            name: "invalid.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("not-an-image")
        });

        await expect(page.locator("#status-banner")).toContainText("Unsupported format");
    });

    test("exports PNG file", async ({ page }) => {
        await page.goto(APP_URL);

        const downloadPromise = page.waitForEvent("download");
        await page.locator("#download-btn").click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toBe("My-Favorite-YGO-Cards.png");
    });
});
