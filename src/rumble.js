const axios = require("axios");
const {xmlToJson, prepareRumbleContent, useGraphql} = require("../util");
const {UPDATE_CHANNEL_CONTENT} = require("../mutations");
const {GET_ALL_CHANNELS} = require("../queries");
const {rss_constants} = require("./constants");


/**
 *
 * @param rumbleId
 * @returns {Promise<{title: string, url: string, image: string, date: string}[]>}
 */
const fetchRumbleData = async (rumbleId) => {
    const url = `${rss_constants.rumble_rss_url}/${rumbleId}`
    const response = await axios.get(url);
    const json = await xmlToJson(response.data);
    const content = await prepareRumbleContent(json);
    return content
}

/**
 * Updates the content of a channel with the latest Rumble content.
 * @param channelId {string} - The ID of the channel to update.
 * @param rumbleId {string} - The ID of the RUMBLE channel to update. NOT the channelId of the channel in the database.
 * @returns {Promise<void>}
 */
async function updateRumbleChannel(rumbleId, channelId) {
    const content = await fetchRumbleData(rumbleId)
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

    const { errors}=await useGraphql(UPDATE_CHANNEL_CONTENT, variables)
    if (errors) {
        fs.writeFileSync("errors.json", JSON.stringify(errors))
        console.error(errors, errors[0].message);
    } else{
        console.log("successfully updated")
    }
}

module.exports = {
    updateRumbleChannel
}