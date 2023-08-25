const {parseStringPromise} = require('xml2js');
const axios = require("axios");
const {GET_ALL_CHANNELS} = require("./queries");
fs = require('fs');

/**
 *
 * @param xmlString {string} - XML string to convert to JSON
 * @returns {Promise<*|null>} - JSON object or null if the XML is invalid
 */
const xmlToJson = async (xmlString) => {
    try {
        return await parseStringPromise(xmlString);
    } catch (err) {
        console.error('Failed to parse XML:', err);
        return null;
    }
};
/**
 * Prepares content from a Rumble RSS feed by mapping the latest 15 items to the required format.
 *
 * @param {Object} json - The parsed JSON object representing the RSS feed.
 * @param {Object} json.rss - The RSS element in the JSON.
 * @param {Object[]} json.rss.channel - The channel information in the RSS.
 * @param {Object[]} json.rss.channel[0].item - The items in the RSS feed.
 * @returns {{title: string, url: string, image: string, date: string}[]} An array of content objects, each containing the title, url, image, and date of the item.
 */
const prepareRumbleContent = (json) => {
    const items = json.rss.channel[0].item.slice(0, 15);
    return items.map((item, index) => ({
        title: item.title[0],
        url: item.guid[0]["_"],
        image: item["itunes:image"][0].$.href,
        date: item.pubDate[0],
    }));
};
const prepareYoutubeContent = (json) => {
    const items = json.feed.entry.slice(0, 15);
    return items.map((item) => ({
        title: item.title[0],
        url: item.link[0].$.href, // Assuming the href is in the first link object
        image: item['media:group'][0]['media:thumbnail'][0].$.url,
        date: item.published[0],
    }));
}

const prepareOdyseeContent = (json) => {

}
/**
 * Executes a GraphQL query using a POST request.
 * @async
 * @function
 * @param {string} query - The GraphQL query string.
 * @param {object} [variables] - The variables to pass to the query.
 * @returns {Promise<{data: Array, errors: Array, status: number}>} An object containing the following properties:
 *   - data: The data returned from the GraphQL query.
 *   - errors: Any errors that occurred during the query.
 *   - status: The HTTP status of the response.
 * @throws Will throw an error if the request fails.
 * @example
 * const { data, errors, status } = await useGraphql('{ user { id name } }');
 */
const useGraphql = async (query, variables) => {
    /**
     * @type {{data: {data: Array, errors: Array, status: number}}}
     */
    const {data: {data, errors}, status} = await axios({
        url: 'http://localhost:4000/graphql',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            query,
            variables,
        },
    });
    if (errors) {
        console.error({errors, status});
    }
    return {data, errors, status}
}


module.exports = {
    prepareRumbleContent,
    prepareYoutubeContent,
    prepareOdyseeContent,
    xmlToJson,
    useGraphql
}