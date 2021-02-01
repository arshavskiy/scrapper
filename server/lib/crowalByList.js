const {saveArticle} = require('./fileManager');
const pageScraper = require('./pageScraper');


async function scrapeAll(browserInstance, categories) {
    let browser;
    try {
        browser = await browserInstance;
        let scrapedData = {};
        await Promise.all(categories.map(async (cat) => {
            // scrapedData[cat] = await pageScraper.scraper(browser, cat);
            await pageScraper.scraper(browser, cat);
            await browser.close();

            // console.log(__filename, 'scrapedData', scrapedData[cat]);
            // saveArticle(cat, scrapedData).then(err => {
            //     if (err) {
            //         console.log(err);
            //     }
            // });

        })).then(data => {
            console.log(__filename, '..done scraping')
            process.exit(1);
        }).catch(err => {
            console.error(err);
        });
    } catch
        (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, categories) => scrapeAll(browserInstance, categories)