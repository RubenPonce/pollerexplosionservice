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
        console.error(errors, errors[0].message);
    } else{
        console.log("successfully updated")
    }
}
const fetchAndUpdateRumbleStaticContent = async () =>{
    try {
const {data, errors}=       await useGraphql(GET_ALL_CHANNELS)

        if(errors){
            console.error(data.errors)
            return
        }
        /**
         * @type {object[]}
         */
        const channels = data.channels;
        const channelsWithRumbleAccs = channels
            .filter(channel => channel.socials.some(social => social.name === "Rumble"))
        //@TODO implement updateChannel for YouTube as well.
        //@TODO add a link to a channel page for Catcher.tv
        /*
         * const youtubeChannelIds = channelsWithYoutubeAccs.map(channel => channel.socials.find(social => social.name === "YouTube").channelId)
         * for (const channelId of youtubeChannelIds) {
         *    await updateChannel(channelId);
         * }
         */
        const rumbleChannelIds = channelsWithRumbleAccs.map(channel => ({rumbleId: channel.socials.find(social => social.name === "Rumble").channelId, dbId: channel.channelId}))

        for (const {rumbleId, dbId} of rumbleChannelIds) {
            await updateRumbleChannel(rumbleId, dbId);
        }
        console.log('Data fetched and sent successfully');
    } catch (error) {
        console.error('An error occurred while fetching data:', error);
        console.error("Error with graphql server.")
    }
}
module.exports = {
    fetchAndUpdateRumbleStaticContent,
    updateChannel: updateRumbleChannel
}