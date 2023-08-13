module.exports = {

  UPDATE_CHANNEL_CONTENT: `#graphql
  mutation UpdateChannel($channelId:String!,$input: UpdateChannelInput!) {
    updateChannel(channelId:$channelId, input: $input) {
      channelId
      name
      content {
        image
        date
        title
        url
      }
    }
  }
  `
}