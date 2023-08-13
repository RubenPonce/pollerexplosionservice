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
//test xml to json
fs.readFile( './pp.xml', 'utf8', async function(err, data) {
    var json = await xmlToJson(data);
    console.log("to json ->", json.rss.channel);
    //console.log(prepareContent(json))
});
 const prepareContent = (json) => {
    const items = json.rss.channel[0].item.slice(0, 15); // Assuming the items are here and taking only the latest 15
    return items.map((item) => ({
        title: item.title[0],
        url: item.link[0],
        image: item.image_url[0], // Adapt based on the actual structure of the feed
        date: item.pubDate[0],
    }));
};


 module.exports = {
    prepareContent,
    xmlToJson
 }