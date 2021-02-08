const fs = require('fs');
const path = require('path');
const util = require('util');
const emitter = require('events').EventEmitter;

const Datastore = require('nedb');

console.time('db loaded');
console.time('dbMissing loaded');
console.time('db_urls loaded');
console.time('db_categories loaded');
console.time('db_dates loaded');

FILE_DB = path.join(__dirname, './db/data.db');
FILE_DB_URLS = path.join(__dirname, './db/data_urls.db');
FILE_DB_ERR = path.join(__dirname, './db/data_err.db');
FILE_DB_CATS = path.join(__dirname, './db/data_categories.db');
FILE_DB_DATES = path.join(__dirname, './db/data_dates.db');

const db = new Datastore({filename: FILE_DB});
const dbMissing = new Datastore({filename: FILE_DB_ERR});
const db_urls = new Datastore({filename: FILE_DB_URLS});
const db_categories = new Datastore({filename: FILE_DB_CATS});
const db_dates = new Datastore({filename: FILE_DB_DATES});

db.loadDatabase(function (err) {
    if (err) console.log('db', err);
    console.timeEnd('db loaded');
});
dbMissing.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_ERR', err);
    console.timeEnd('dbMissing loaded');
});
db_urls.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_URLS', err);
    console.timeEnd('db_urls loaded');
});
db_categories.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_CATS', err);
    console.timeEnd('db_categories loaded');
});
db_dates.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_DATES', err);
    console.timeEnd('db_dates loaded');
});

db.em = new emitter();


let doneExistsSync = false;

function readUrlFileAsync(folderName) {
    const readdir = util.promisify(fs.readdir);
    return readdir(folderName);
}


function readUrlFile(folderName, cb) {
    let data;
    try {
        data = fs.readdirSync(folderName, 'utf-8');
        return cb(data);
    } catch (e) {
        console.log(__filename, e);
        return
    }
}

function addMissingDataToDB(data) {

    let scrapedMissingData = {
        'url': data.url,
        'category': data.category,
        'title': data.title,
        'date_added': Date.now()
    };

    // let missingFound = dbMissing.find({url: scrapedMissingData.url}, function (err, docs) {
    //     // If no document is found, docs is equal to []
    //     if (err) console.log(err);
    //     if (docs) {
    //         console.info(__filename, 'missing_db duplicate found', docs.url);
    //         db.em.emit('missing_db', docs);
    //     }
    //     return docs;
    // });
    //
    // if (!missingFound) {

    dbMissing.insert(scrapedMissingData, function (err, newDoc) {
        if (err) {
            return console.error(err);

        }
    });
    // }

}

async function saveArticle(data, missing) {
    console.time('starting to write');

    if (missing) {
        console.log('missing: ', data);
        addMissingDataToDB(data);
    }

    let scrapedData = {
        'url': data.url,
        'category': data.category,
        'title': data.title,
        'img': data.imageUrl,
        'text': data.body,
        'date': data.date || null,
        'date_added': Date.now(),
    }

    const dir = scrapedData.category;
    const DIRNAME = path.join(__dirname, '../data', dir);
    // const fileName = path.join(__dirname, '../data', dir, 'data.txt');

    if (!doneExistsSync) {
        doneExistsSync = true;
        if (!fs.existsSync(DIRNAME)) {
            try {
                fs.mkdirSync(DIRNAME);
            } catch (e) {
                console.error(e);
                return
            }
        }
    }

    db.insert(scrapedData, function (err, newDoc) {
        if (err) {
            return console.error(err);
        }
        db.em.emit('db_added', newDoc.title);
    });

    // fs.appendFile(fileName, JSON.stringify(scrapedData) + ',/r/n', 'utf8', err => {
    //     if (err) {
    //         return console.error(err);
    //     }
    //     console.log("The data has been scraped and saved successfully! View it at './data.txt'");
    // });

    console.timeEnd('starting to write');

}

async function saveCategoryUrls(category, urls) {
    const dir = category;

    if (!doneExistsSync) {
        doneExistsSync = true;
        if (!fs.existsSync(path.join(__dirname, '../data', dir))) {
            try {
                fs.mkdirSync(path.join(__dirname, '../data', dir));
            } catch (e) {
                console.error(e);
                return
            }
        }
    }

    urls.forEach(url => {
        db_urls.insert({category: category, url: url}, function (err, newDoc) {
            if (err) {
                return console.error(err);
            }
            // db.em.emit('db_urls added', newDoc.url);
            console.log("db_urls updated: ", newDoc.url);
        })
    });


    const fileName = path.join(__dirname, '../data', category, category + '.temp_urls');
    let dataToSave = urls.join('\r\n');

    fs.appendFile(fileName, dataToSave, 'utf8', err => {
        if (err) {
            console.error(err);
        }
        console.log("urls updated: ", fileName);
    });

}


function getCategoryByName(name) {
    return new Promise((resolve, reject) => {
        console.log(__filename, name);
        db.find({category: name}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                reject(err)
            }
            console.log(__filename, docs);
            resolve(docs);
        });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        db_categories.find({}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                reject(err)
            }
            console.log(__filename, docs);
            resolve(docs);
        });
    });
}

function getDates() {
    return new Promise((resolve, reject) => {
        db_dates.find({}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                reject(err)
            }
            console.log(__filename, docs);
            resolve(docs);
        });
    });
}


module.exports = {
    readUrlFile,
    saveArticle,
    saveCategoryUrls,
    db_em: db.em,
    db: db,
    getCategoryByName: getCategoryByName,
    getCategories: getCategories,
    getDates:getDates,
};