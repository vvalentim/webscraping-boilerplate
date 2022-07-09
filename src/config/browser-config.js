/* Puppeteer browser configuration. */
export default {
  headless: true,
  devtools: true,
  slowMo: 0,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-web-security",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-features=IsolateOrigins,site-per-process",
    `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36`,
  ],
  ignoreHTTPSErrors: true,
};
