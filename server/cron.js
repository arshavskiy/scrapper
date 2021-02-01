const cron = require('node-cron');
const express = require('express');
const shell = require('shelljs');

app = express();

cron.schedule('* 4 * * *', function () {
    console.log('---------------------');
    console.log('Running Cron Job');
    if (shell.exec('node getUrls url=http://zen.yandex.ru/t/').code !== 0) {
        shell.exit(1);
    } else {
        shell.echo('getUrls complete');
    }

    // if (shell.exec('node readUrls').code !== 0) {
    //     shell.exit(1);
    // } else {
    //     shell.echo('readUrls complete');
    // }
});


// app.listen(5001);