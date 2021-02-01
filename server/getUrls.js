const scraperLinksController = require('./lib/linksController');
const browserObject = require('./lib/browser');
const arguments = require('./lib/helpers').parseMyArgs();
const browserInstance = browserObject.startBrowser();

let categories = ['технологии', 'финансы', 'хакеры'];
let defaults = 'https://zen.yandex.ru/t/';

try {
    if (typeof arguments.cat === "object" || !arguments.cat) {
        categories = arguments.cat || categories;
        scraperLinksController(browserInstance, categories, arguments.url || defaults).then(data => {
            console.log(__filename, "done scraping - ", categories);
        });
    }

} catch (e) {
    console.error(e);
}

