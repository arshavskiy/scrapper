const parseMyArgs = () => {
    const args = process.argv.slice(2);
    let argsMap = {};
    args.map(ra => argsMap[ra.split('=')[0]] = ra.split('=')[1]);
    return argsMap;
}

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
    return newCode;
}

module.exports = {
    parseMyArgs
}
