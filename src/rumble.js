const axios = require("axios");
const {xmlToJson, prepareRumbleContent} = require("../util");
const {UPDATE_CHANNEL_CONTENT} = require("../mutations");
const {GET_ALL_CHANNELS} = require("../queries");
const production = process.env.NODE_ENV === 'production';
const environment = {
    rssurl: production ? "http://rssgen.xyz/rumble" : "http://localhost:9000/rumble"
}
const fetchRumbleData = async (channelId) => {
    const url = `${environment.rssurl}/${channelId}`
    const response = await axios.get(url);
    const json = await xmlToJson(response.data);
    const content = await prepareRumbleContent(json);
    return content
}

/**
 * Updates the content of a channel with the latest Rumble content.
 * @param channelId {string} - The ID of the RUMBLE channel to update. NOT the channelId of the channel in the database.
 * @returns {Promise<void>}
 */
async function updateChannel(channelId) {
    const content = await fetchRumbleData(channelId)
    if(!content){
        console.error("no content")
        return
    }
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
            console.log("successfully updated channel: ", channelId)
            console.log({result})
        })
        .catch((error) => {
            console.error(error);
        });
}
const fetchAndUpdateRumbleStaticContent = async () =>{
    try {
        const {data: { data } } = await axios({
            url: 'http://localhost:4000/graphql',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                query: GET_ALL_CHANNELS,
            },
        });

        const channels = data.channels;
        //@TODO optimize this to only fetch channels with rumble accounts
        const channelsWithRumbleAccs = channels
            .filter(channel => channel.socials.some(social => social.name === "Rumble"))

        const rumbleChannelIds = channelsWithRumbleAccs.map(channel => channel.socials.find(social => social.name === "Rumble").channelId)
        //@TODO ensure that non main Rumble channels are getting updated. see https://rumble.com/user/ColoradoPedPatrolLiveCatches
        // Fetch data for each RUMBLE channel
        for (const channelId of rumbleChannelIds) {
            await updateChannel(channelId);
        }
        console.log('Data fetched and sent successfully');
    } catch (error) {
        console.error('An error occurred while fetching data:', error);
    }
}
module.exports = {
    fetchAndUpdateRumbleStaticContent,
    updateChannel
}