import "./config/env.js";
import * as scraperList from "./scrapers/scrapers.js";

const main = async () => {
  const useScrapers = ["REDDIT"];

  for (const scraper in scraperList) {
    const instance = scraperList[scraper];

    /* Run only the scraper modules that you wish to. */
    if (useScrapers.includes(instance.name)) {
      await instance.start();

      for (const keyword of instance.keywords) {
        await instance.run(keyword);
      }

      await instance.done();
    }
  }
};

main()
  .then(() => {
    console.log("All done.");
  })
  .catch((err) => {
    console.debug(err);
    process.exit(1);
  });
