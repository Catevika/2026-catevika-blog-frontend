/// <reference types="node" />
import { test, expect } from "@playwright/test";
import { loginUI } from "../helpers";
import { Buffer } from "buffer";

test("device photo upload → preview → insert → drag", async ({ page }) => {
  await loginUI(page, "john@gmail.com", "12345678");

  // Mock upload endpoint
  await page.route("**/api/upload/image", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          url: "/uploads/device-photo.png",
          filename: "device-photo.png",
          duplicate: false,
        },
      }),
    });
  });

  // Tiny PNG
  const PNG_1x1 = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2N7WcAAAAASUVORK5CYII=",
    "base64",
  );

  // Uploader root
  const uploader = page
    .locator("aside#pexels-sidebar")
    .locator("section")
    .first();

  // Open uploader
  await uploader.getByText("Upload JPG, JPEG or PNG", { exact: true }).click();

  // Upload file
  await uploader.locator('input[type="file"]').setInputFiles({
    name: "device-photo.png",
    mimeType: "image/png",
    buffer: PNG_1x1,
  });

  // Preview visible
  const preview = uploader.locator('article[aria-label="Image preview"]');
  await expect(preview.locator("img[alt='Preview']")).toBeVisible();

  // Insert → final markdown
  await preview.getByRole("button", { name: "Insert", exact: true }).click();

  const editor = page.locator('textarea[id$="-textarea"]');
  await expect(editor).toContainText("/uploads/device-photo.png");

  // Drag → final markdown again
  const dragSource = preview.locator(".photo-card-image");

  // Create DataTransfer object inside browser context
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

  // Fire dragstart on the uploader preview
  await dragSource.dispatchEvent("dragstart", { dataTransfer });

  // Fire drop on the editor
  await editor.dispatchEvent("drop", { dataTransfer });

  // Expect final markdown again
  await expect(editor).toContainText("/uploads/device-photo.png");
});
