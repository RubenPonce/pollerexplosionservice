const production = process.env.NODE_ENV === 'production';
const rss_constants = {
    rumble_rss_url: production ? "http://rssgen.xyz/rumble" : "http://localhost:9000/rumble",
    youtube_rss_url: production ? "https://www.youtube.com/feeds/videos.xml?channel_id=" : "http://localhost:9000/youtube",
}

module.exports = {
    rss_constants,
    /**
     * Content type
     * @type {Content}
     */
    Content: {title: string, url: string, image: string, date: string}
}