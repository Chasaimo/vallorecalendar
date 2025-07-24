const fetch = require("node-fetch");

exports.handler = async () => {
  const API_KEY = process.env.YT_API_KEY;
  const channels = JSON.parse(process.env.YT_CHANNELS || '[]');

  let events = [];

  for (let chan of channels) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}`
              + `&channelId=${chan}&part=snippet`
              + `&eventType=upcoming&type=video&maxResults=5`;
    const res = await fetch(url);
    const data = await res.json();

    data.items.forEach(item => {
      events.push({
        id: item.id.videoId,
        title: item.snippet.channelTitle + " – " + item.snippet.title,
        start: item.snippet.publishedAt,
        url: `https://youtu.be/${item.id.videoId}`,
        allDay: false
      });
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(events)
  };
};
