import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3100);
const executablePath = process.env.PW_CHROMIUM ?? (process.env.CI ? undefined : "/opt/pw-browsers/chromium");

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 }, launchOptions: { executablePath } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, launchOptions: { executablePath } } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    port,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_HOTLINE: "+8801711000001",
      NEXT_PUBLIC_WHATSAPP: "+8801711000002",
      NEXT_PUBLIC_SITE_URL: "https://landdoctor.test",
    },
  },
});
