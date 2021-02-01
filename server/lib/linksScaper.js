const {saveCategoryUrls} = require('./fileManager');


const scraperObjectLinks = {
    async scraperLinks(browser, category, url) {

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
                saveCategoryUrls(category[i], currentPageData).then(err => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(__filename, 'category saved');
                        console.log(__filename, currentPageData);

                    }
                })
            }
        } else {
            currentPageData = await pagePromise(category, url);
            saveCategoryUrls(category, currentPageData).then(err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(__filename, 'category saved');
                    console.log(__filename, currentPageData);

                }
            })
        }
    }
}


module.exports = scraperObjectLinks;