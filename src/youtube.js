const axios = require("axios");
const {xmlToJson, useGraphql} = require("../util");
const {UPDATE_CHANNEL_CONTENT} = require("../mutations");
const {GET_ALL_CHANNELS} = require("../queries");
const {rss_constants} = require("./constants");
const fs = require("fs");
/**
 * @typedef {import('./constants.js').Content} Content
 */
/**
 * @param youtubeid
 * @returns {Promise<Content[]>}
 */
const fetchYoutubeXmlData = async (youtubeid) => {
    const url = `${rss_constants.youtube_rss_url}${youtubeid}`
    const response = await axios.get(url);
    const json = await xmlToJson(response.data);
    const content = await prepareYoutubeContent(json);
    return content
}
//@TODO implement updateChannel for YouTube as well.
/**
 * Updates the content of a channel with the latest Youtube content.
 * @param json
 * @returns {Content[]}
 */
const prepareYoutubeContent = (json) => {
    const items = json.feed.entry.slice(0, 15);
    return items.map((item) => ({
        title: item.title[0],
        url: item.link[0].$.href, // Assuming the href is in the first link object
        image: item['media:group'][0]['media:thumbnail'][0].$.url,
        date: item.published[0],
    }));
}



/**
 * Updates the content of a channel with the latest Rumble content.
 * @param channelId {string} - The ID of the channel to update.
 * @param youtubeChannelId {string} - The ID of the Youtube channel to update. NOT the channelId of the channel in the database.
 * @returns {Promise<void>}
 */
async function updateYoutubeChannel(youtubeChannelId, channelId) {
    const content = await fetchYoutubeXmlData(youtubeChannelId)
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
    updateYoutubeChannel
}