const emitter = require('events').EventEmitter;
const em = new emitter();
const scraperLinksController = require('./lib/linksController');
const browserObject = require('./lib/browser');
const arguments = require('./lib/helpers').parseMyArgs();
const browserInstance = browserObject.startBrowser();
const {saveCategoryUrls} = require("./fileManager");

let categories = ['технологии', 'финансы', 'хакеры'];
let defaults = 'https://zen.yandex.ru/t/';


if (typeof arguments.cat === "object" || !arguments.cat) {
    categories = arguments.cat || categories;
    scraperLinksController(browserInstance, categories, arguments.url || defaults, em).then(data => {
        console.log(__filename, "done scraping - ", categories);
    }).catch(e => {
        console.error(e);

    });
}

em.addListener('SAVE_URL', data => {
    console.log('SAVE_URL data', data);
    saveCategoryUrls(data.category, data.url).then(err => {
        if (err) {
            console.log(err);
        } else {
            console.log(__filename, 'category saved');
            console.log(__filename, data);
        }
    });
    console.log('data', data);
});