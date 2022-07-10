const prepareWebdriver = async (page) => {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });
};

const prepareChrome = async (page) => {
  await page.evaluateOnNewDocument(() => {
    window.navigator.chrome = {
      runtime: {},
    };
  });
};

const preparePermissions = async (page) => {
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    const overrideQuery = (parameters) => {
      if (parameters.name === "notifications") {
        return Promise.resolve({ state: Notification.permission });
      }

      return originalQuery(parameters);
    };

    window.navigator.permissions.query = overrideQuery;
  });
};

const preparePlugin = async (page, opts) => {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "plugins", {
      get: () => opts.plugins || [1, 2, 3, 4, 5],
    });
  });
};

const prepareLang = async (page, opts) => {
  const defaultLangHeaders = "en-US, en;q=0.9, *;q=0.7";
  const defaultBrowserLang = ["en-US", "en"];

  await page.setExtraHTTPHeaders({
    "Accept-Language": opts.languages || defaultLangHeaders,
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "language", {
      get: () => opts.browserLanguages || defaultBrowserLang,
    });

    Object.defineProperty(navigator, "languages", {
      get: () => opts.browserLanguages || defaultBrowserLang,
    });
  });
};

/**
 * Override properties and methods on a puppeteer page instance.
 *
 * @param {Puppeteer.Page} page Puppeteer page to be prepared.
 * @param {*} prepare An object with the tests that should be prepared.
 * @param {*} opts An object with optional properties to pass for each test.
 */
const preparePage = async (
  page,
  { webdriver = false, chrome = false, permission = false, plugins = false, languages = false, all = false },
  opts = {}
) => {
  /* Webdriver Test */
  if (webdriver || all) {
    await prepareWebdriver(page);
  }

  if (chrome || all) {
    await prepareChrome(page);
  }

  if (permission || all) {
    await preparePermissions(page);
  }

  if (plugins || all) {
    await preparePlugin(page, opts);
  }

  if (languages || all) {
    await prepareLang(page, opts);
  }
};

export default preparePage;
