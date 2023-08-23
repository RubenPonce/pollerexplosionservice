const {useGraphql} = require("../util");
const {GET_ALL_CHANNELS} = require("../queries");
const {updateYoutubeChannel} = require("./youtube");
const {updateRumbleChannel} = require("./rumble");
const fetchAndUpdateStaticContent = async () => {
    try {
        const { data, errors } = await useGraphql(GET_ALL_CHANNELS);

        if (errors) {
            console.error(data.errors);
            return;
        }

        /**
         * @type {object[]}
         */
        const channels = data.channels;
        const rumbleChannelIds = [];
        const youtubeChannelIds = [];

        // Iterate through channels, checking for Rumble and YouTube socials
        channels.forEach(channel => {
            channel.socials.forEach(social => {
                if (social.name === "Rumble") {
                    rumbleChannelIds.push({ rumbleId: social.channelId, dbId: channel.channelId });
                }
                if (social.name === "Youtube") {
                    youtubeChannelIds.push({ youtubeId: social.channelId, dbId: channel.channelId });
                }
            });
        });

        for (const { rumbleId, dbId } of rumbleChannelIds) {
            await updateRumbleChannel(rumbleId, dbId);
        }

        for (const { youtubeId, dbId } of youtubeChannelIds) {
            await updateYoutubeChannel(youtubeId, dbId);
        }

        console.log('Data fetched and sent successfully');
    } catch (error) {
        console.error('An error occurred while fetching data:', error);
        console.error("Error with graphql server.");
    }
}

module.exports = {
    fetchAndUpdateStaticContent
}