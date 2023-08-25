const production = process.env.NODE_ENV === 'production';
/**
 * @typedef {Object} Content - The content object.
 * @property {string} title - The title of the content
 * @property {string} url - The URL of the content
 * @property {string} image - The image URL of the content
 * @property {string} date - The date of the content
 */


const rss_constants = {
    Rumble:  "http://localhost:9000/rumble/",
    Youtube: "https://www.youtube.com/feeds/videos.xml?channel_id=",
    Odyssey: "https://odysee.com/$/rss/channels/@",
}

module.exports = {
    rss_constants,
}