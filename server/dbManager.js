// const express = require('express');
const path = require('path');
const fs = require('fs');
const {urlsToScrap} = require('./lib/helpers');


// const {readUrlFile} = require('fileManager');

// const DATA_FOLDER = path.join(__dirname, '..', 'data');
// let finalFilesToScan = {};

const Datastore = require('nedb');

// console.time('db loaded');
// console.time('dbMissing loaded');
// console.time('db_urls loaded');

FILE_DB = path.join(__dirname, './db/data.db');
FILE_DB_URLS = path.join(__dirname, './db/data_urls.db');
FILE_DB_ERR = path.join(__dirname, './db/data_err.db');

// const db = new Datastore({filename: FILE_DB});
// const dbMissing = new Datastore({filename: FILE_DB_ERR});
const db_urls = new Datastore({filename: FILE_DB_URLS});

// db.loadDatabase(function (err) {
//     if (err) console.log('db', err);
//     // console.timeEnd('db loaded');
// });
// dbMissing.loadDatabase(function (err) {
//     if (err) console.log('FILE_DB_ERR', err);
//     // console.timeEnd('dbMissing loaded');
// });


function insertDB(url, category, i) {
    return new Promise(resolve => {
        db_urls.insert({url:url, category:category}, (err, newDoc) => {
            if(err){
                console.log(__filename,err);
                return
            }
            console.info('db_urls pushed :', i);
            resolve();
        });
    });
}

db_urls.loadDatabase(function (err) {
    if (err) console.log('FILE_DB_URLS', err);
    // console.timeEnd('db_urls loaded');

    let allUrlsToPush = urlsToScrap();
    console.log('allUrlsToPush', allUrlsToPush.length);

    let categories = Object.keys(allUrlsToPush);
    for (let i = 0; i < categories.length; i++) {

        let list = allUrlsToPush[categories[i]];
        let category = categories[i];

        console.info(' list', list.length);
        console.info(' category', category);

        // list.map(url=>{
        //     insertDB(url, category, i).then(data=>{
        //         console.info(' 3:', i);
        //     });
        // })

    }

});



// db.loadDatabase(err=>{
//     console.error('db',err);
// });

// const app = express();
// app.listen(5001, ()=>console.log('Running http://localhost:5000 at 5000'));

const dbManager = {}

dbManager.init = () => {

}

dbManager.init();


module.exports = dbManager;