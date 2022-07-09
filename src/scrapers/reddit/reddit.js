/* This is just an example of the configuration and usage for a scraper module. */
import moment from "moment";
import getUuidByString from "uuid-by-string";

import { preparePage } from "../../utils/utils.js";
import init from "../../config/scraper-config.js";

/* Source configuration. */
const SCRAPER_NAME = "REDDIT";
const INITIAL_ENDPOINT = "https://www.reddit.com/";
const IS_SEARCH = false;

const headerCSV = ["id", "source", "title", "clipp_date", "comments"];

const sourceSelectors = {
  front_page: {
    post_anchor: "a[data-click-id='body']",
  },
  post_page: {
    content_gated: "div[data-testid='content-gate']",
    title: "div[data-test-id='post-content'] h1",
    num_comments: "a[data-test-id='comments-page-link-num-comments']",
    comments: "div.Comment div[data-testid='comment']",
  },
};

const generateEntryData = ({ url, title, comments = [] }) => {
  return {
    id: getUuidByString(url),
    source: url,
    title,
    clipp_date: moment(new Date()).format("YYYYMMDD HH:mm:ss"),
    comments: comments.map((comment) => `"${comment}"`).join(" "),
  };
};

const scrapPage = async function (page, urlList) {
  const entries = [];

  for (const url of urlList) {
    /* Navigate to the post page. */
    await Promise.all([page.goto(url), page.waitForNetworkIdle()]);

    /* Scroll and wait for a bit so we can load more comments. */
    await Promise.all([page.evaluate(() => window.scrollBy(0, 768 * 10)), page.waitForNetworkIdle()]);

    /* Extract the data from the post page. */
    const { title, num_comments, comments, content_gated } = await page.evaluate((selectors) => {
      const title = document.querySelector(selectors.title);
      const num_comments = document.querySelector(selectors.num_comments);
      const content_gated = document.querySelector(selectors.content_gated);
      const comments_sel = Array.from(document.querySelectorAll(selectors.comments));
      const comments_text = [];

      /* Extract top five comments including only those at the top of the chain. */
      for (const comment of comments_sel) {
        if (comments_text.length >= 5) {
          break;
        }

        const parent = comment.parentElement;
        const level = parent.querySelector("span");

        /* Check if this comment is from the top of the chain. */
        if (level && level.textContent.trim() == "level 1") {
          comments_text.push(comment.textContent.trim());
        }
      }

      return {
        content_gated: content_gated ? true : false,
        title: title ? title.textContent.trim() : "",
        num_comments: num_comments ? num_comments.textContent.trim() : "",
        comments: comments_text,
      };
    }, sourceSelectors.post_page);

    const data = generateEntryData({
      url,
      content_gated,
      title,
      num_comments,
      comments,
    });

    /* We can take the opportunity to get the document from the page if we don't want to access it again. */
    await this.saveDOC(page, data.id);

    entries.push(data);
  }

  return entries;
};

/**
 * If the search flag is set to true, the run function will execute for each keyword from
 * the keywords file (make sure it exist). Else it will execute at least once.
 */
const run = async function () {
  console.log(`Running source: ${this.name}`);

  const browser = this.getBrowserInstance();

  /* Prepare for scraping the source, navigate to the initial endpoint. */
  const page = await browser.newPage();
  await preparePage(page, { all: true });
  await page.setViewport(this.getDefaultViewport());
  await Promise.all([page.goto(INITIAL_ENDPOINT), page.waitForNetworkIdle()]);

  /* Extract the URLs from the top five posts from the front page. */
  const urlList = await page.evaluate((selectors) => {
    return Array.from(document.querySelectorAll(selectors.post_anchor))
      .map((anchor) => {
        let url = null;
        if (anchor.getAttribute("href")) {
          url = `https://www.reddit.com${anchor.getAttribute("href")}`;
        }
        return url;
      })
      .splice(0, 5);
  }, sourceSelectors.front_page);

  const entries = await this.scrapPage(page, urlList);

  /* Save the results into a CSV file. */
  await this.saveCSV(entries, `TRENDING_${moment(new Date()).format("HH_mm_ss")}`);
  await page.close();
};

/**
 * Don't forget to include all the functions which need scoping (this keyword).
 * You can also change/override the methods from "scraper-config" if you need to.
 */
export default {
  ...init(SCRAPER_NAME, import.meta.url, IS_SEARCH),
  headerCSV,
  run,
  scrapPage,
};
