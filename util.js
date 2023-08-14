const {parseStringPromise} = require('xml2js');
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


 module.exports = {
    prepareRumbleContent,
    xmlToJson
 }