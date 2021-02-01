const pageScraper = require('./pageScraper');


async function scrapeAll(browserInstance, cat, urls, em) {
    let browser;
    try {
        browser = await browserInstance;
        // console.log(__filename, urls.length);
        await pageScraper.scraper(browser, cat, urls, em).catch(err=>{
            return console.error(err);
        });
        await browser.close();

    } catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, cat, urls, em) => scrapeAll(browserInstance, cat, urls, em)