const axios = require("axios");

const {rss_constants} = require("./constants");
const {xmlToJson, prepareRumbleContent, useGraphql, prepareOdyseeContent, prepareYoutubeContent} = require("../util");
const {UPDATE_CHANNEL_CONTENT, DELETE_SOCIAL} = require("../mutations");
const {GET_ALL_CHANNELS} = require("../queries");
const prepareContent = (json, socialType) => {
    if (socialType === "Rumble") {
        return prepareRumbleContent(json);
    }
    if (socialType === "Youtube") {
        return prepareYoutubeContent(json);
    }
    if (socialType === "Odyssey") {
        return prepareOdyseeContent(json);
    }


    console.error(`Unknown social type: ${socialType}`);
    return null;
}
/**
 *
 * @param socialId - The ID of the social to fetch data for.
 * @param socialType - The type of the social to fetch data for.
 * @param channelId - The ID of the content creator in the database to update.
 * @returns {Promise<{title: string, url: string, image: string, date: string}[]|*|null>}
 */
const fetchContentData = async (socialId, socialType, channelId) => {
    try {
        const url = `${rss_constants[socialType]}${socialId}`
        const response = await axios.get(url);
        const json = await xmlToJson(response.data);
        const content = await prepareContent(json, socialType);
        return content
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error(`${socialId} of type ${socialType} was banned or deleted.`);
            await useGraphql(DELETE_SOCIAL, {channelId, socialId})

            console.log(`Deleted social ${socialId} from channel ${channelId} in the database.`);
        } else {
            console.error(`An error occurred while fetching data for ${socialId}:`, error);
        }
        return null;
    }
}
const updateChannelContent = async (socialId, channelId, socialType) => {
    const content = await fetchContentData(socialId, socialType, channelId)
    if (!content) {
        console.error("no content")
        return
    }
    const variables = {
        channelId: channelId,
        input: {
            content: content
        },
    };

    const {errors} = await useGraphql(UPDATE_CHANNEL_CONTENT, variables)
    if (errors) {
        fs.writeFileSync("errors.json", JSON.stringify(errors))
        console.error(errors, errors[0].message);
    } else {
        console.log("successfully updated")
    }
}


/**
 * Updates the content of a channel with the latest content.
 * @returns {Promise<void>}
 */
const updateChannel = async () => {
    try {
        const {data, errors} = await useGraphql(GET_ALL_CHANNELS);
        if (errors) {
            console.error(data.errors);
            return;
        }
        /**
         * @type {object[]}
         */
        const channels = data.channels;
        const updateChannelIds = [];

        channels.forEach(channel => {
            channel.socials.forEach(social => {
                const channelId = social.channelId;
                const dbId = channel.channelId;
                const socialType = social.name;
                if (channelId && dbId && socialType) {
                    updateChannelIds.push({channelId, dbId, socialType});
                } else {
                    console.error(`Invalid channel id, db id, or social type: ${channelId}, ${dbId}, ${socialType}`);
                }
            });
        });
        for (const {channelId, dbId, socialType} of updateChannelIds) {
            await updateChannelContent(channelId, dbId, socialType);
        }
        console.log('Data fetched and sent successfully');
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    updateChannel
}