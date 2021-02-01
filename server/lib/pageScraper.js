const scraperObject = {
    async scraper(browser, category, urls, em) {
        let currentPageData = {};

        const pagePromise = (link) => new Promise(async (resolve, reject) => {

            let dataObj = {};
            console.time('scraped');

            const newPage = await browser.newPage();
            await newPage.setDefaultNavigationTimeout(0);
            // await newPage.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");
            await newPage.setViewport({
                width: 1920,
                height: 1440,
                deviceScaleFactor: 1,
            });

            try {
                await newPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

                const result = await newPage.goto(link, {
                    waitUntil: "load",
                }).catch(err => {
                    return console.error(err);
                });

                // get the User Agent on the context of Puppeteer
                const userAgent = await newPage.evaluate(() => navigator.userAgent );
                console.log(userAgent);

                if (result.status() === 200) {
                    console.info('newPage url', newPage.url());
                    if (newPage.url().includes('zen.yandex')) {

                        dataObj['title'] = await newPage.$eval('h1', title => {
                            if (title && title.innerText) {
                                return title.innerText;
                            } else {
                                return null;
                            }
                        });
                        dataObj['date'] = await newPage.$eval('.article-stat__date-container', elm => {
                            if (elm && elm.innerText) {
                                return elm.innerText;
                            } else {
                                return null;
                            }
                        });
                        dataObj['imageUrl'] = await newPage.$eval('.article__middle img', img => {
                            if (img && img.src) {
                                return img.src;
                            } else {
                                return null;
                            }
                        });
                        dataObj['body'] = await newPage.evaluate(() => {
                            let articleBody = '';
                            let elements = document.getElementsByClassName('article__middle');
                            for (let element of elements)
                                articleBody += element.innerText;
                            return articleBody;
                        });

                    } else {

                        dataObj['title'] = await newPage.$eval('h1', title => {
                            if (title && title.innerText) {
                                return title.innerText
                            } else {
                                return null;
                            }
                        });
                        dataObj['imageUrl'] = await newPage.$eval('img', img => {
                            if (img && img.src) {
                                return img.src;
                            } else {
                                return null;
                            }
                        });
                        dataObj['body'] = await newPage.evaluate(() => {
                            let articleBody = '';
                            let elements = document.getElementsByTagName('p');
                            for (let element of elements)
                                articleBody += element.innerText;
                            return articleBody;
                        });
                    }
                } else {
                    reject('500');
                }

            } catch (e) {
                console.timeEnd('scraped');
                console.error(e);
                reject(e);
            }
            await newPage.close();
            console.timeEnd('scraped');
            resolve(dataObj);

        }).catch(e => {
            console.error(e);
        });

        if (typeof urls === "string") {
            currentPageData = await pagePromise(urls);
            currentPageData.url = urls;
            console.log('scraped :', urls);
        } else {
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                currentPageData = await pagePromise(url);
                currentPageData.url = url.split['?'] ? url.split['?'].pop() : url;
                console.log('scraped :', i + 1, 'of ', urls.length, url);
            }
        }

        currentPageData.category = category;
        em.emit('scraped', currentPageData);
    }
}

module.exports = scraperObject;