const URL = 'http://localhost:3000/tweets';
const trendURL = 'http://localhost:3000/trends/?id=4118';
let nextPageUrl = null;

const onEnter = (e) => {
  if (e.key == 'Enter') {
    getTwitterData();
  }
};
const onNextPage = () => {
  if (nextPageUrl) {
    getTwitterData(true);
  }
};
/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
  const search = document.getElementById('search-box').value;

  if (!search) return;
  const encodedQuery = encodeURIComponent(search);
  let fullUrl = `${URL}?q=${encodedQuery}&count=10`;
  if (nextPage && nextPageUrl) {
    fullUrl = nextPageUrl;
  }
  fetch(fullUrl)
    .then((response) => response.json())
    .then((data) => {
      buildTweets(data.statuses, nextPage);
      saveNextPage(data.search_metadata);
      nextPageButtonVisibility(data.search_metadata);
    });
};

const getTrendData = () => {
  fetch(trendURL)
    .then((response) => response.json())
    .then((data) => {
      populateTrends(data[0].trends);
    });
};

function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
}

const populateTrends = (trends) => {
  console.log(trends);
  const popularTrends = trends
    .sort((a, b) => b.tweet_volume - a.tweet_volume)
    .slice(0, 10);

  // create variety in trending topics, by skipping some if there is a large amount
  const currentTrends =
    popularTrends.length >= 10
      ? popularTrends.filter((tweet, i) => i % 2 == 0)
      : popularTrends;
  let trendHTML = '';
  currentTrends.forEach((trend) => {
    trendHTML += `<li onclick="
    selectTrend(this)"><div class="tweets-trending-title">${
      trend.name
    }</div><div class="tweets-trending-volume">${nFormatter(
      parseInt(trend.tweet_volume),
      1
    )} Tweets</div></li>`;
  });
  document
    .getElementById('tweets-trending-list')
    .insertAdjacentHTML('beforeend', trendHTML);
};
/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${URL}${metadata.next_results}`;
  } else {
    nextPageUrl = null;
  }
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (el) => {
  console.log(el.querySelector('.tweets-trending-title').innerText);
  const currentTrend = el.querySelector('.tweets-trending-title').innerText;
  document.getElementById('search-box').value = currentTrend;
  getTwitterData();
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    document.getElementById('next-page').style.visibility = 'visible';
  } else {
    document.getElementById('next-page').style.visibility = 'hidden';
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
  console.log(tweets);
  let twitterContent = '';
  tweets.map((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();
    twitterContent += `<div class="tweet-container">
    <div class="tweet-user-info">
      <div class="tweet-user-profile" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
      <div class="tweet-user-name-container">
        <div class="tweet-user-fullname">${tweet.user.name}</div>
        <div class="tweet-user-username">@${tweet.user.screen_name}</div>
      </div>
    </div>`;
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      twitterContent += buildImages(tweet.extended_entities.media);
      twitterContent += buildVideo(tweet.extended_entities.media);
    }

    twitterContent += `
    <div class="tweet-text-container">
      ${tweet.full_text}
    </div>
    <div class="tweet-date-container">${createdDate}</div>
  </div>`;
  });
  if (nextPage) {
    document
      .querySelector('.tweets-list')
      .insertAdjacentHTML('beforeend', twitterContent);
  } else {
    document.querySelector('.tweets-list').innerHTML = twitterContent;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  let imagesContent = `<div class='tweet-images-container'>`;
  let imageExists = false;
  mediaList.map((media) => {
    if (media.type == 'photo') {
      imageExists = true;
      imagesContent += `<div class='tweet-image' style="background-image: url(${media.media_url_https})"></div>`;
    }
  });
  imagesContent += `</div>`;
  return imageExists ? imagesContent : '';
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  let videoContent = `<div class='tweet-video-container'>`;
  let videoExists = false;
  mediaList.map((media) => {
    if (media.type == 'video') {
      videoExists = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == 'video/mp4'
      );
      videoContent += `<video controls>
        <source src="${videoVariant.url}" type="video/mp4" />
      </video>`;
    } else if (media.type == 'animated_gif') {
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == 'video/mp4'
      );
      videoExists = true;
      videoContent += `<video loop autoplay>
        <source src="${videoVariant.url}" type="video/mp4" />
      </video>`;
    }
  });
  videoContent += `</div>`;
  return videoExists ? videoContent : '';
};
getTrendData();
getTwitterData();
