const {saveCategoryUrls} = require('../fileManager');


const scraperObjectLinks = {
    async scraperLinks(browser, category, url, em) {

        let pagePromise = (category, url) => new Promise(async (resolve, reject) => {
            url = url || 'http://zen.yandex.ru/';
            let newUrl = url + category;

            let links;

            let page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);
            await page.setViewport({
                width: 1920,
                height: 1248,
                deviceScaleFactor: 1,
            });
            await page.goto(newUrl, {
                waitUntil: "load",
            });

            let urls = await page.$$eval('.card-image-view-by-metrics', (cards) => {
                links = cards.map(card => card.querySelector('a.card-image-view-by-metrics__clickable').href);
                return links;
            });

            await page.close();
            resolve(urls);
        }).catch(e => console.error(e));

        let currentPageData = {};

        if (typeof category === "object"){
            for (let i = 0; i < category.length; i++) {
                currentPageData = await pagePromise(category[i], url);
                em.emit('SAVE_URL', {'url':currentPageData ,'category': category[i]});

            }
        } else {
            currentPageData = await pagePromise(category, url);
            em.emit('SAVE_URL', {'url':currentPageData ,'category': category});
        }
    }
};


module.exports = scraperObjectLinks;