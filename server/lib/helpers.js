const parseMyArgs = () => {
    const args = process.argv.slice(2);
    let argsMap = {};
    args.map(ra => argsMap[ra.split('=')[0]] = ra.split('=')[1]);
    return argsMap;
}

module.exports = {
    parseMyArgs
}
