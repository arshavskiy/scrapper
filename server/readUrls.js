const path = require('path');
const fs = require('fs');
const emitter = require('events').EventEmitter;


const browserObject = require('./lib/browser');
const scraperController = require('./lib/pageController');
const {readUrlFile} = require('./fileManager');
const {saveArticle} = require("./fileManager");
// const {db_em} = require("./fileManager");
const {db} = require('./fileManager');
const em = new emitter();
const arguments = require('./lib/helpers').parseMyArgs();


const DATA_FOLDER = path.join(__dirname, '..', 'data');
let browserInstance = browserObject.startBrowser();
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

const scrap = async (urls,urlsFromDB) => {
    let categories = Object.keys(urls);
    for (let i = 0; i < categories.length; i++) {

        let list = urls[categories[i]];
        let category = categories[i];

        const myArrayFiltered = list.filter( el => {
            return urlsFromDB.some(f => {
                if (el && f.url){
                    return !f.url.includes(el);
                }
            });
        });

        // console.log(myArrayFiltered);

        console.log('list -', list.length);
        console.log('filtered -', myArrayFiltered.length);

        await runPageScraper(category, myArrayFiltered);
    }
}

const scrapOne = async (arguments) => {
    await runPageScraper(arguments.cat, arguments.url)
}


let urlsToScrap = () => {
    let finalFilesToScan = {};

    return readUrlFile(DATA_FOLDER, data => {
        console.time('read');
        let FOLDER_NAMES = data.filter(files => !files.includes('.'))

        if (arguments.cat) {
            FOLDER_NAMES = [arguments.cat];
        }

        FOLDER_NAMES.forEach(folder => {
            const FILE_NAME = folder + '.urls'
            const PATH = path.join(DATA_FOLDER, folder, FILE_NAME);

            urlsFromFile = fs.readFileSync(PATH, 'utf-8');
            let splitUrlsFromFile = urlsFromFile.split("\n");

            finalFilesToScan[folder] = splitUrlsFromFile;

            console.log('read ', splitUrlsFromFile.length, ' urls')
        })
        console.timeEnd('read');
        return finalFilesToScan;
    });
}

function allCurrentData() {
    return new Promise(resolve => {
        db.find({}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                return
            }
            resolve(docs);
        });
    });
}

if (arguments.url && arguments.cat) {

    scrapOne(arguments).then(data => {
        console.log('done scraping ', arguments.url, ' url')
    }).catch(err => {
        return console.log(err)
    });

} else {
    let tempUrlsToScrap = urlsToScrap();

    allCurrentData().then(dataBase => {
        console.log('dataBase -', dataBase.length);
        scrap(tempUrlsToScrap, dataBase).then(data => {
            console.log('done scraping ', tempUrlsToScrap.length, ' urls')
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

db.em.addListener('db_added', function (data) {
    console.debug(__filename, data);
});
db.em.addListener('db_found', function (data) {
    // console.debug('db_found :', data.url);
});
db.em.addListener('missing_db', function (data) {
    // console.debug('missing_db :', data.url);
});
// Pass the browser instance to the scraper controller
// process.exit(0);


