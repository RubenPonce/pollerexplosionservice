const {updateChannel} = require("./src/updateChannel");

const nodeArguments = process.argv.slice(2);
const runOnce = nodeArguments[0] === '--run-once';
const help = nodeArguments[0] === '--help';
if (help) {
    console.log("This script will fetch content from Rumble and update the database with the content")
    //@TODO add interval
    console.log("Use --run-once to run the script once, otherwise it will run for the specified interval")
    return
}

function singleRun() {
    updateChannel()
}

if (runOnce) {
    singleRun()
}
