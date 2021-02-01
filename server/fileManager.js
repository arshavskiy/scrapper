const fs = require('fs');
const path = require('path');
const util = require('util')
const emitter = require('events').EventEmitter;

const Datastore = require('nedb');

console.time('db loaded');
console.time('dbMissing loaded');

FILE_DB = path.join(__dirname, './db/data.db');
FILE_DB_ERR = path.join(__dirname, './db/data_err.db');


const db = new Datastore({filename: FILE_DB});
const dbMissing = new Datastore({filename: FILE_DB_ERR});

db.loadDatabase(function (err) {
    if (err) console.log('db', err);
    console.timeEnd('db loaded');
});
dbMissing.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_ERR', err);
    console.timeEnd('dbMissing loaded');
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
        'date_added': Date.now(),
    }

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

    const fileName = path.join(__dirname, '../../data', category, category + '.urls');

    fs.appendFile(fileName, urls.join('\r\n'), 'utf8', err => {
        if (err) {
            console.error(err);
        }
        console.log("urls updated: ", fileName);
    });

}


module.exports = {
    readUrlFile,
    saveArticle,
    saveCategoryUrls,
    db_em: db.em,
    db: db
};