const {parseStringPromise} = require('xml2js');
const axios = require("axios");
fs = require('fs');
const dotenv = require("dotenv");
const _ = require("lodash");
dotenv.config();

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
 * Prepare content fetched from a Rumble JSON feed
 * @param json
 * @param socialType
 * @returns {*}
 */
const prepareRumbleContent = (json, socialType) => {
    const items = _.slice(_.get(json, 'rss.channel[0].item'), 0, 15);
    return _.map(items, (item) => ({
        title: _.get(item, 'title[0]'),
        url: _.get(item, 'guid[0]._'),
        image: _.get(item, 'itunes:image[0].$.href'),
        date: _.get(item, 'pubDate[0]'),
        socialType: socialType
    }));
};

/**
 * Prepare content fetched from a Youtube JSON feed
 * @param {Object} json - The JSON object containing the Youtube feed
 * @param {string} socialType - The type of social media (not used here, but included for consistency)
 * @return {Array} - An array of simplified Youtube content objects
 */
const prepareYoutubeContent = (json, socialType) => {
    const items = _.get(json, 'feed.entry', []).slice(0, 15);
    return items.map((item) => ({
        title: _.get(item, 'title[0]', ''),
        url: _.get(item, 'link[0].$.href', ''),
        image: _.get(item, 'media:group[0].media:thumbnail[0].$.url', ''),
        date: _.get(item, 'published[0]', ''),
        socialType: socialType
    }));
};


/**
 * Prepare content fetched from a Odysee JSON feed
 * @param json
 * @param socialType
 * @returns {*}
 */
const prepareOdyseeContent = (json, socialType) => {
    const items = _.get(json, 'rss.channel[0].item', []).slice(0, 15);
    return items.map((item) => ({
        title: _.get(item, 'title[0]', ''),
        url: _.get(item, 'link[0]', ''),
        image: _.get(item, 'itunes:image[0].$.href', ''),
        date: _.get(item, 'pubDate[0]', ''),
        socialType: socialType
    }));
};
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
            Authorization : process.env.GRAPHQL_TOKEN
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