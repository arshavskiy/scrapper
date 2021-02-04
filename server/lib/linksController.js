const scraperObjectLinks = require('./linksScaper');


async function scraperLinks(browserInstance, cat, urls, em) {
    let browser;
    try {
        browser = await browserInstance;
        await scraperObjectLinks.scraperLinks(browser, cat, urls, em);
        await browser.close();

    } catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, cat, urls, em) => scraperLinks(browserInstance, cat, urls, em);