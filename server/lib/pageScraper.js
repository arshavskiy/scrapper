const scraperObject = {
    async scraper(browser, category, urls, em) {
        let currentPageData = {};

        const baseUrl = (url) => {
            let temp = url;
            if (url.includes('?')) {
                temp = url.split('?')[0];
            }
            return temp;
        }

        const pagePromise = (link) => new Promise(async (resolve, reject) => {
            let dataObj = {};
            console.time('scraped');

            try {
                const newPage = await browser.newPage();
                await newPage.setDefaultNavigationTimeout(0);
                await newPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

                await newPage.setViewport({
                    width: 1920,
                    height: 1440,
                    deviceScaleFactor: 1,
                });

                const result = await newPage.goto(link, {
                    waitUntil: "load",
                }).catch(err => {
                    return console.log(err);
                });

                if (result.status() === 200) {

                    if (newPage.url().includes('//zen.yandex.')) {

                        dataObj['title'] = await newPage.$eval('h1', title => {
                            if (title && title.innerText) {
                                return title.innerText;
                            } else {
                                return null;
                            }
                        }).catch(e=>{
                            console.log(e);
                        });
                        dataObj['date'] = await newPage.$eval('.article-stat__date-container', elm => {
                            if (elm && elm.innerText) {
                                return elm.innerText;
                            } else {
                                return null;
                            }
                        }).catch(e=>{
                            console.log(e);
                        });
                        dataObj['imageUrl'] = await newPage.$eval('.article__middle img', img => {
                            if (img && img.src) {
                                return img.src;
                            } else {
                                return null;
                            }
                        }).catch(e=>{
                            console.log(e);
                        });
                        dataObj['body'] = await newPage.evaluate(() => {
                            let articleBody = '';
                            let elements = document.getElementsByClassName('article__middle');
                            for (let element of elements)
                                articleBody += element.innerText;
                            return articleBody;
                        }).catch(e=>{
                            console.log(e);
                        });

                    } else {

                        dataObj['title'] = await newPage.$eval('h1', title => {
                            if (title && title.innerText) {
                                return title.innerText
                            } else {
                                return null;
                            }
                        }).catch(e=>{
                            console.log(e);
                        });
                        dataObj['imageUrl'] = await newPage.$eval('img', img => {
                            if (img && img.src) {
                                return img.src;
                            } else {
                                return null;
                            }
                        }).catch(e=>{
                            console.log(e);
                        });
                        dataObj['body'] = await newPage.evaluate(() => {
                            let articleBody = '';
                            let elements = document.getElementsByTagName('p');
                            for (let element of elements)
                                articleBody += element.innerText;
                            return articleBody;
                        }).catch(e=>{
                            console.log(e);
                        });
                    }
                } else {
                    em.emit('scraped missing', urls);
                    console.info('500 on :', i + 1, 'of ', urls.length, urls);
                    // reject('500');
                }
                await newPage.close();
                console.timeEnd('scraped');
                resolve(dataObj);
            } catch (e) {
                console.log(e);
                await newPage.close();
                console.timeEnd('scraped');
                resolve({'err':e});
            }

        }).catch(e => {
            console.log(e);
        });

        if (typeof urls === "string") {
            currentPageData = await pagePromise(urls);
            currentPageData.url = baseUrl(urls);
            console.info('scraped :', urls);

        } else {

            try {
                for (let i = 0; i < urls.length; i++) {
                    let url = urls[i];
                    console.info('scraping', i + 1, baseUrl(url));

                    currentPageData = await pagePromise(url).catch(err => {
                        console.log(err);
                    });
                    currentPageData.url = baseUrl(url);
                    currentPageData.category = category;

                    if (currentPageData && currentPageData.body) {
                        em.emit('scraped', currentPageData);
                        console.info('scraped :', i + 1, 'of ', urls.length, currentPageData.title);
                    } else {
                        em.emit('scraped missing', currentPageData);
                        console.info('scraped :', i + 1, 'of ', urls.length, url, 'but could not find p elements');
                    }
                }
            } catch (e) {
                console.log(e);
            }

        }
    }
}

module.exports = scraperObject;