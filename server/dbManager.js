// const express = require('express');
const path = require('path');
const fs = require('fs');
// const {urlsToScrap} = require('./lib/helpers');


// const {readUrlFile} = require('fileManager');

// const DATA_FOLDER = path.join(__dirname, '..', 'data');
// let finalFilesToScan = {};

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


function insertDBDate(date) {
    return new Promise(resolve => {
        db_dates.insert({date: date}, (err, newDoc) => {
            if (err) {
                console.log(__filename, err);
                return
            }
            console.info(date,'pushed');
            resolve(newDoc);
        });
    });
}

function insertDBCat(category) {
    return new Promise(resolve => {
        db_categories.insert({category: category}, (err, newDoc) => {
            if (err) {
                console.log(__filename, err);
                return
            }
            console.info(category,'pushed');
            resolve(newDoc);
        });
    });
}

function getDates() {
    return new Promise(resolve => {
        console.log('db.find','getDates');
        db.find({}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                reject(err)
            }
            let dates = docs.reduce((acc, it) => (acc.push(it.date), acc), []);
            let categories = docs.reduce((acc, it) => (acc.push(it.category), acc), []);
            dates = [...new Set(dates)];
            categories = [...new Set(categories)];
            // console.log(__filename, dates);
            // console.log(__filename, uniqueValues);

            resolve({dates,categories});
        });
    });
}

// db.loadDatabase(function (err) {
//     if (err) console.log('FILE_DB_URLS', err);
//     // console.timeEnd('db_urls loaded');
//
//     let allUrlsToPush = urlsToScrap();
//     console.log('allUrlsToPush', allUrlsToPush.length);
//
//     let categories = Object.keys(allUrlsToPush);
//     for (let i = 0; i < categories.length; i++) {
//
//         let list = allUrlsToPush[categories[i]];
//         let category = categories[i];
//
//         console.info(' list', list.length);
//         console.info(' category', category);
//
//         list.map(url=>{
//             insertDB(url, category, i).then(data=>{
//                 console.info(' 3:', i);
//             });
//         })
//
//     }
//
// });


// db.loadDatabase(err=>{
//     console.error('db',err);
// });


function getCategoryByName(name) {
    return new Promise(resolve => {
        console.log('db_urls', name);
        db_urls.find({category:name}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                return
            }
            console.log(__filename, docs);
            resolve(docs);
        });
    });
}

function getCategory(name) {
    return new Promise(resolve => {
        console.log('db', name);
        db.find({category:name}, (err, docs) => {
            if (err) {
                console.log(__filename, err);
                reject(err)
            }
            console.log(__filename, docs);
            resolve(docs);
        });
    });
}


// console.log('db хакеры');
// getCategory('хакеры').then(data => {
//     console.log(data)
// }).catch(err => {
//     console.log(err);
// });
// getCategoryByName('технологии').then(data => {
//     console.log(data)
// }).catch(err => {
//     console.log(err);
// });
getDates().then(data => {
    console.log(data);

    data.dates.map(date=>{
        insertDBDate(date);
    });
    data.categories.map(cat=>{
        insertDBCat(cat);
    })
}).catch(err => {
    console.log(err);
});

const dbManager = {}

dbManager.init = () => {

}

dbManager.init();


module.exports = dbManager;