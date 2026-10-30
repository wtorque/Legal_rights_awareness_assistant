import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4310", trace: "off" },
  webServer: {
    command: "npm run start -- -p 4310",
    url: "http://localhost:4310/dashboard",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
