// const express = require('express');
const path = require('path');
const fs = require('fs');
const {readUrlFile} = require('fileManager');

const DATA_FOLDER = path.join(__dirname, '..', 'data');
let finalFilesToScan = {};


const Datastore = require('nedb');
// const db = new Datastore({filename: '../db/data.db'});
const db = new Datastore({filename: '../db/data.db', autoload:true});

// db.loadDatabase(err=>{
//     console.error('db',err);
// });

// const app = express();
// app.listen(5001, ()=>console.log('Running http://localhost:5000 at 5000'));

const dbManager = {}
let urlsFromFile;

dbManager.init = () => {

    // db.loadDatabase(function (err) {

        let docs = db.find({ url: 'https://zen.yandex.ru/media/lampexpert/evrosoiuz-pohoronit-beskorpusnuiu-mikroshemukapelku-6007d34728c8a925485b7e7b' }, function (err, docs) {
            console.info('found', docs);
            return docs;
        });
}

dbManager.init();


module.exports = dbManager;