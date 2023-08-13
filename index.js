const axios = require('axios');
const {UPDATE_CHANNEL_CONTENT} = require("./mutations");
const {prepareContent, xmlToJson} = require("./util");
//I need to parse xml from the xml source for rumb le, and for youtube, and then make a ContentFactory that will assign contentData the
//correct data for the correct provider
// The function that will be run to fetch and process the data
async function updateChannel(channelId, contentData) {
    const response = await axios.get('http://rssgen.xyz/rumble/PredatorPoachers');
    const data = response.data;
    const json = await xmlToJson(data);
    console.log({json})
    if(!data) {
        console.log("no data")
        return
    }
    const content = await prepareContent(json);
    const variables = {
        channelId: channelId,
        input: {
            content: content
        },
    };


    axios({
        url: 'http://localhost:4000/graphql',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            query: UPDATE_CHANNEL_CONTENT,
            variables: variables,
        },
    })
        .then((result) => {
            // Process the result.data.data here
            console.log({result})
        })
        .catch((error) => {
            console.error(error);
        });
}
updateChannel("PredatorPoachers")
async function fetchData() {
    try {
        // Fetch data from the desired URL


        // Process the data as needed

        // Send the processed data to the Deliverer

        console.log('Data fetched and sent successfully');
    } catch (error) {
        console.error('An error occurred while fetching data:', error);
    }
}

// Run fetchData every 10 minutes
setInterval(fetchData, 10 * 60 * 1000);

