const express = require('express');
const router = express.Router();
const {getCategoryByName, getCategories} = require('../server/fileManager');

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log(req.params);
    res.send('respond with a resource');
});

router.get('/:categoryName', async function (req, res, next) {
    let temp = req.params.categoryName;
    console.info(__filename, 'temp',temp);
    const category = decodeURIComponent(temp);

    let data = await getCategoryByName(category).catch(err => {
        console.log(err);
    });
    let categories = await getCategories().catch(err => {
        console.log(err);
    });

    res.render('category', {categories: categories, articles:data});
});

module.exports = router;
