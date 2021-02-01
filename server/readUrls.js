const path = require('path');
const fs = require('fs');
const emitter = require('events').EventEmitter;


const browserObject = require('./lib/browser');
const scraperController = require('./lib/pageController');
const {readUrlFile} = require('./fileManager');
const {saveArticle} = require("./fileManager");
const {db_em} = require("./fileManager");
const em = new emitter();
const arguments = require('./lib/helpers').parseMyArgs();


const DATA_FOLDER = path.join(__dirname, '..', 'data');
let browserInstance = browserObject.startBrowser();
let finalFilesToScan = {};
let urlsFromFile;


// function cb(newDada) {
//     let insideFiles = newDada.filter(files => !files.includes('data'));
//     finalFilesToScan = finalFilesToScan.concat(insideFiles)
// }

const runPageScraper = (cat, urls) => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof urls === "string") {
                console.log('scraping', cat, urls);
            } else {
                console.log('scraping', cat, urls.length, '..urls');
            }
            scraperController(browserInstance, cat, urls, em).then(data => {
                console.log('done');
                resolve(data);
            });
        } catch (e) {
            console.error(e);
            // return reject(e);
        }
    })
}

const scrap = async () => {
    let categories = Object.keys(finalFilesToScan);
    for (let i = 0; i < categories.length; i++) {
        await runPageScraper(categories[i], finalFilesToScan[categories[i]]);
    }
}

const scrapOne = async (arguments) => {
    await runPageScraper(arguments.cat, arguments.url)
}


if (arguments.url && arguments.cat) {

    scrapOne(arguments).then(data => {
        console.log('done scraping ', finalFilesToScan, ' url')
    }).catch(err => {
        return console.log(err)
    });

} else {

    readUrlFile(DATA_FOLDER, data => {
        console.time('read');
        let FOLDER_NAMES = data.filter(files => !files.includes('.'))

        // FOLDER_NAMES.forEach(folder => {
        //     readUrlFile(path.join(__dirname, 'data', folder), cb);
        // });

        if (arguments.cat) {
            FOLDER_NAMES = [arguments.cat];
        }

        FOLDER_NAMES.forEach(folder => {
            const FILE_NAME = folder + '.urls'
            const PATH = path.join(DATA_FOLDER, folder, FILE_NAME);
            urlsFromFile = fs.readFileSync(PATH, 'utf-8');
            let splittedUrlsFromFile = urlsFromFile.split("\n");
            finalFilesToScan[folder] = splittedUrlsFromFile;

            console.log('read ', splittedUrlsFromFile.length, ' urls')
        })


        console.timeEnd('read');

        scrap().then(data => {
            console.log('done scraping ', finalFilesToScan, ' urls')
        }).catch(err => {
            return console.log(err)
        });

    });


}


//Subscribe FirstEvent
em.addListener('scraped', function (data) {

    saveArticle(data).then(err => {
        if (err) {
            console.error(err);
        }
    });

});
em.addListener('scraped missing', function (data) {

    saveArticle(data, true).then(err => {
        if (err) {
            console.error(err);
        }
    });

});

db_em.addListener('db_added', function (data) {
    console.debug(__filename, data);
});
db_em.addListener('db_found', function (data) {
    // console.debug('db_found :', data.url);
});
db_em.addListener('missing_db', function (data) {
    // console.debug('missing_db :', data.url);
});
// Pass the browser instance to the scraper controller
// process.exit(0);


