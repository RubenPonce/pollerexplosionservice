const GET_ALL_CHANNELS = `#graphql
    query {
        channels {
            channelId
            name
            socials {
                name
                channelId
            }
        }
    }`;

module.exports = {
    GET_ALL_CHANNELS
}