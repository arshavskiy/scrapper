const path = require('path');
const fs = require('fs');
const {readUrlFile} = require('../fileManager');


const parseMyArgs = () => {
    const args = process.argv.slice(2);
    let argsMap = {};
    args.map(ra => argsMap[ra.split('=')[0]] = ra.split('=')[1]);
    return argsMap;
}

const DATA_FOLDER = path.join(__dirname, '../..', 'data');

function removeDuplicateLine(newCode) {
    // newCode = newCode.trim();
    let match = /\r\n/.test(newCode);
    let theSep;
    if (match == -1) {
        //windows line breaks
        theSep = "\r\n";
        newCode = newCode.replace(/\r\n+/g, "\r\n");
    } else {
        //unix line breaks
        theSep = "\n";
        newCode = newCode.replace(/\r/g, "\n");
        newCode = newCode.replace(/\n+/g, "\n");

    }

    //Create array
    let newCodeArray = newCode.split(theSep);
    for (let i = 0; i < newCodeArray.length; i++) {
        newCodeArray[i] = newCodeArray[i].trim();
    }

    //Remove duplicates
    let i = newCodeArray.length - 1;
    while (i > -1) {
        let ii = newCodeArray.length - 1;
        while (ii > -1) {
            if (i != ii) {
                if (newCodeArray[i] === newCodeArray[ii]) {
                    newCodeArray.splice(ii, 1);
                }
            }
            ii--;
        }
        i--;
    }

    // if(document.getElementById("sortNone").checked === false){
    //     //Do some sorting
    //     //Using the default sort helps with grouping capitals first - Ban, ban, Can, can, etc.
    //     newCodeArray.sort();
    //
    //     //Natural sorting
    //     if(document.getElementById("sortAlpha").checked === true){
    //         naturalSort.insensitive = true;
    //         newCodeArray.sort(naturalSort);
    //     }
    //
    //     if(document.querySelector('#reverseSort:checked')){
    //         newCodeArray.reverse();
    //     }
    //
    // }

    //Assemble the lines back together
    newCode = newCodeArray.join(theSep);
    return {
        cleanFile: newCode,
        newCode: newCodeArray
    };
}

const urlsToScrap = () => {
    let finalFilesToScan = {};

    return readUrlFile(DATA_FOLDER, data => {
        console.time('read');
        let FOLDER_NAMES = data.filter(files => !files.includes('.'))

        if (arguments.cat) {
            FOLDER_NAMES = [arguments.cat];
        }

        FOLDER_NAMES.forEach(folder => {
            const TEMP_PATH = folder + '.temp_urls'
            const PATH = folder + '.temp'
            const TEMP_FILE = path.join(DATA_FOLDER, folder, TEMP_PATH);
            const FILE = path.join(DATA_FOLDER, folder, PATH);

            let urlsFromFile = fs.readFileSync(TEMP_FILE, 'utf-8');
            let cleanDataFromFile = removeDuplicateLine(urlsFromFile);

            fs.writeFile(FILE, cleanDataFromFile.cleanFile, 'utf8', err => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("cleanFile updated: ", PATH);
            });

            finalFilesToScan[folder] = cleanDataFromFile.newCode;
            console.log('read ', cleanDataFromFile.newCode.length, ' urls')
        })
        console.timeEnd('read');
        return finalFilesToScan;
    });
}

urlsToScrap();


module.exports = {
    parseMyArgs,
    urlsToScrap
}
