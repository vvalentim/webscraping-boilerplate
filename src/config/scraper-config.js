import path from "node:path";
import os from "node:os";
import puppeteer from "puppeteer";
import moment from "moment";
import { fileURLToPath } from "node:url";

import browserConfig from "./browser-config.js";
import { fileFetch, getKeywords, writeToFile } from "../utils/utils.js";

const scraperDefault = (name, dir, search, launchConfig = null) => {
  /* Get the current directory for the scraper instance. */
  const cur_dir = path.dirname(fileURLToPath(dir));

  /* Default to where the keywords file is located. */
  const path_keywords = path.resolve(cur_dir, `${name.toLowerCase()}.txt`);

  /* Default to where the results from scraping will be saved. */
  const path_repository = path.resolve(cur_dir, "repository", name);

  /* An array with the keywords which will be used for scraping. */
  const keywords = search ? getKeywords(path_keywords) : ["NO_SEARCH"];

  /* Default character used to delimit columns of the CSV file. */
  const delimiterCSV = "|";

  /* Default page viewport. */
  const defaultViewport = { width: 1366, height: 768 };

  /**
   * The browser instance (puppeteer) used by the scraper, whenever the
   * scraper starts it must launch a new one, while it's running you can
   * relaunch it and when the scraper is done it must be closed.
   */
  let browserInstance = null;

  const getBrowserInstance = () => {
    return browserInstance;
  };

  const getDefaultViewport = () => {
    return { ...defaultViewport };
  };

  /* Runs when the scraper starts. */
  const start = async function () {
    if (browserInstance == null) {
      browserInstance = await puppeteer.launch(launchConfig || browserConfig);
    }
  };

  /* Runs when the scraper is done. */
  const done = async function () {
    if (browserInstance != null) {
      await browserInstance.close();
      browserInstance = null;
    }
  };

  /* Relaunch the browser instance. */
  const relaunch = async function () {
    await done();
    await start();
  };

  /**
   * Default save option will create a PDF from the current page.
   * If the url param is set, creates a request and fetch from it.
   */
  const saveDOC = async function (page, id, url = null, fetchOpts = {}) {
    let file = { data: null, extension: "pdf" };

    if (!url) {
      await page.emulateMediaType("screen");
      file.data = await page.createPDFStream({ format: "A4" });
    } else {
      file = await fileFetch(page, url, fetchOpts);
    }

    if (file) {
      const filepath = path.resolve(
        path_repository,
        moment(new Date()).format("YYYY/MM/DD"),
        file.extension,
        `${id}.${file.extension}`
      );

      await writeToFile(filepath, file.data);

      console.log(`✔ DOC: ${filepath}`);
    }
  };

  /**
   * This function will parse an array of objects with the corresponding
   * "columns" (keys) and save into a CSV file. If the filename isn't set,
   * it will take the scraper instance name for it.
   */
  const saveCSV = async function (rows, filename = null) {
    let content = `${this.headerCSV.join(this.delimiterCSV)}`;

    for (const row of rows) {
      content += `${os.EOL}${this.headerCSV
        .map((column) => {
          if (row[column] != undefined) {
            let data = row[column];

            if (typeof data != "string") {
              data = data.toString();
            }

            data = data.replaceAll(os.EOL, "");
            data = data.replaceAll(this.delimiterCSV, "");

            return data;
          }

          return "";
        })
        .join(this.delimiterCSV)}`;
    }

    const filepath = path.resolve(
      path_repository,
      moment(new Date()).format("YYYY/MM/DD"),
      "csv",
      `${filename || this.name}.csv`
    );

    await writeToFile(filepath, content);

    console.log(`✔ CSV: ${filepath}`);
  };

  return {
    name,
    keywords,
    delimiterCSV,
    getBrowserInstance,
    getDefaultViewport,
    start,
    done,
    relaunch,
    saveDOC,
    saveCSV,
  };
};

export default scraperDefault;
