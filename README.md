# webscraping-boilerplate

A small collection of utilities to provide a rough way of organizing/structuring when creating simple webscrapers with Puppeteer.

## Installation

Simple installation using `npm install`

## Usage

First, check the `src/main.js` if you want to load any environment variables to use.

You will also be able to select the list of scraper modules (by their name) that you want to execute when running `npm run start`.

    ...
    const useScrapers = ["REDDIT", "YOUTUBE", "INSTAGRAM", ...];
    ...

After that you can take a look at the configuration folder `src/config/`, which has the default properties to launch a new browser (puppeteer) instance and the base object that you can use when you create a new scraper module.

This project also contains an example of usage and configuration for the website [Reddit](https://www.reddit.com).
