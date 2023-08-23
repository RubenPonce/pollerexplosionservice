const production = process.env.NODE_ENV === 'production';
/**
 * @typedef {Object} Content
 * @property {string} title - The title of the content
 * @property {string} url - The URL of the content
 * @property {string} image - The image URL of the content
 * @property {string} date - The date of the content
 */

const rss_constants = {
    rumble_rss_url: production ? "http://rssgen.xyz/rumble" : "http://localhost:9000/rumble",
    youtube_rss_url: "https://www.youtube.com/feeds/videos.xml?channel_id="
}

module.exports = {
    rss_constants,
}