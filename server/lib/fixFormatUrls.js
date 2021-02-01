const fs = require('fs');
const path = require('path');
const readline = require('readline');

// let readStream = fs.createReadStream('/data/технологии/технологии.urls');
// // This will wait until we know the readable stream is actually valid before piping
// readStream.on('open', function (chunk) {
//     // This just pipes the read stream to the response object (which goes to the client)
//     console.log('chunk', chunk);
// });
//
// // This catches any errors that happen while creating the readable stream (usually invalid names)
// readStream.on('error', function (err) {
//     console.error(err);
// });


const rd = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname ,'/data/технологии/технологии.urls')),
    output: process.stdout,
    console: false
});

rd.on('line', function (line) {
    console.log('line', line);
});
