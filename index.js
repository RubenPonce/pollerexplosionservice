const {updateChannel} = require("./src/updateChannel");

const nodeArguments = process.argv.slice(2);
const runOnce = nodeArguments[0] === '--run-once';
const help = nodeArguments[0] === '--help';
const channelId = nodeArguments[0] === '--channelId' ? nodeArguments[1] : null;
if (help) {
    console.log("This script will fetch content from Rumble and update the database with the content")
    //@TODO add interval
    console.log("Use --run-once to run the script once, otherwise it will run for the specified interval")
    return
}

function singleRun() {
    console.log("running fetchAndUpdateStaticContent once")
    //fetchAndUpdateStaticContent()
    updateChannel()
}


if (channelId) {
    runForChannel()
}
if (runOnce) {
    singleRun()
}
// Run fetchData every 10 minutes
//setInterval(fetchData, 10 * 60 * 1000);
