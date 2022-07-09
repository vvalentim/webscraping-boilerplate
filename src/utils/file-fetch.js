import mime from "mime-types";
import { Buffer } from "node:buffer";

const defaultFilters = ["pdf", "doc", "docx", "rtf", "json"];

/**
 * Evaluate a fetch request on the browser context (puppeteer) and returns the base64 encoded dataUrl and file extension.
 *
 * @param {Puppeteer.Page} page Puppeteer page where fetch will be evaluated.
 * @param {string} url The address where the file is located.
 * @param {*} requestOpts An object containing properties to fetch the file (check Fetch API).
 * @param {Array<string>} typeFilters An array of strings with permitted file extensions.
 * @returns {{ buffer: (Node.Buffer), fileType: (string)}} An object with the file buffer and extension.
 */
const fetchFile = async (page, url, requestOpts, typeFilters = null) => {
  const filters = Array.isArray(typeFilters) ? typeFilters : defaultFilters;
  const response = await page.evaluate(
    (url, requestOpts) => {
      return new Promise(async (resolve) => {
        const file = await fetch(url, requestOpts);
        const blob = await file.blob();
        const reader = new FileReader();
        const contentType = file.headers.get("content-type");

        reader.readAsDataURL(blob);
        reader.onload = () => resolve({ data: reader.result, contentType });
        reader.onerror = () => resolve(false);
      });
    },
    url,
    requestOpts
  );

  if (response.contentType) {
    const extension = mime.extension(response.contentType);

    if (!filters.includes(extension)) {
      throw new Error(`Extension not permitted (${extension}): ${url}`);
    }

    if (response.data) {
      const data = response.data.split("base64,")[1];
      const buffer = Buffer.from(data, "base64");

      return { data: buffer, extension };
    }
  }

  throw new Error(`Failed to fetch from: ${url}`);
};

export default fetchFile;
