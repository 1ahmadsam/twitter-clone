const axios = require('axios');
const url = 'https://api.twitter.com/1.1/search/tweets.json';
const trendURL = 'https://api.twitter.com/1.1/trends/place.json';
class Twitter {
  get(query, count, maxId) {
    return axios.get(url, {
      params: {
        q: query,
        count: count,
        tweet_mode: 'extended',
        max_id: maxId,
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    });
  }
  getTrends(id) {
    return axios.get(trendURL, {
      params: {
        id: id,
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    });
  }
}

module.exports = Twitter;
