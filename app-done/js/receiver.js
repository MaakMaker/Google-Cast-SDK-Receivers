const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const playbackConfig = new cast.framework.PlaybackConfig();

//Media Sample API Values
const SAMPLE_URL = "/content.json";
const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};
const TEST_STREAM_TYPE = StreamType.DASH;

// Debug Logger
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = "MyAPP.LOG";

// Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
castDebugLogger.setEnabled(true);

// Show debug overlay
// castDebugLogger.showDebugLogs(true);

// Set verbosity level for Core events.
castDebugLogger.loggerLevelByEvents = {
  "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
  "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
};

// Set verbosity level for custom tags.
castDebugLogger.loggerLevelByTags = {
  LOG_TAG: cast.framework.LoggerLevel.DEBUG,
};

function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, (request) => {
  castDebugLogger.info(LOG_TAG, "Intercepting LOAD request");

  // Map contentId to entity
  if (request.media && request.media.entity) {
    request.media.contentId = request.media.entity;
  }

  return new Promise((resolve, reject) => {
    // Fetch repository metadata
    makeRequest("GET", SAMPLE_URL).then(function (data) {
      // Obtain resources by contentId from downloaded repository metadata.
      let item = data[request.media.contentId];
      if (!item) {
        // Content could not be found in repository
        castDebugLogger.error(LOG_TAG, "Content not found");
        reject();
      } else {
        // Adjusting request to make requested content playable
        request.media.contentType = TEST_STREAM_TYPE;

        // Configure player to parse DASH content
        if (TEST_STREAM_TYPE == StreamType.DASH) {
          request.media.contentUrl = item.stream.dash;

          // playbackConfig.licenseUrl =
          //   "https://wv.service.expressplay.com/hms/wv/rights/?ExpressPlayToken=BQAAABJ1Kc8AJGFmZWI1ZGY0LTE5N2MtNDMxZi1iYzk2LTEzOWRhYWI4YjM5ZQAAAGDKQ9N_PifiN2Ty2BWqv6yM7Fv-TZ3N8lPPi2qtuZV4MO5zKQBa9ZYPGDnS4ZjJCrNbZDu-Q1dBahd3UiJUAab3vRnhea6VKWAkZX9cEAdzTtU6nRiNEuQQCb12GUBvDFojaugBwzwZHXUQXzst2rZpFhTFQA";
          // playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
          // playbackConfig.licenseRequestHandler = (requestInfo) => {
          //   requestInfo.withCredentials = true;
          // };

          // Update playback config licenseUrl according to provided value in load request.
          context.getPlayerManager().setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
            // if (loadRequest.media.customData && loadRequest.media.customData.licenseUrl) {
            // playbackConfig.licenseUrl = loadRequest.media.customData.licenseUrl;
            playbackConfig.licenseUrl =
              "https://wv.service.expressplay.com/hms/wv/rights/?ExpressPlayToken=BQAAABJ1Kc8AJGFmZWI1ZGY0LTE5N2MtNDMxZi1iYzk2LTEzOWRhYWI4YjM5ZQAAAGDKQ9N_PifiN2Ty2BWqv6yM7Fv-TZ3N8lPPi2qtuZV4MO5zKQBa9ZYPGDnS4ZjJCrNbZDu-Q1dBahd3UiJUAab3vRnhea6VKWAkZX9cEAdzTtU6nRiNEuQQCb12GUBvDFojaugBwzwZHXUQXzst2rZpFhTFQA";
            playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
            // playbackConfig.licenseRequestHandler = (requestInfo) => {
            //   requestInfo.withCredentials = true;
            // };
            // }
            return playbackConfig;
          });
        }

        // Configure player to parse HLS content
        else if (TEST_STREAM_TYPE == StreamType.HLS) {
          request.media.contentUrl = item.stream.hls_ts;

          console.log("HERE WE GO");
          console.log(request.media.contentUrl);
          request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
          request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
        }

        castDebugLogger.warn(LOG_TAG, "Playable URL:", request.media.contentUrl);

        // Add metadata
        let metadata = new cast.framework.messages.GenericMediaMetadata();
        metadata.title = item.title;
        metadata.subtitle = item.author;

        request.media.metadata = metadata;

        // Resolve request
        resolve(request);
      }
    });
  });
});

// Optimizing for smart displays
const touchControls = cast.framework.ui.Controls.getInstance();
const playerData = new cast.framework.ui.PlayerData();
const playerDataBinder = new cast.framework.ui.PlayerDataBinder(playerData);

let browseItems = getBrowseItems();

function getBrowseItems() {
  let browseItems = [];
  makeRequest("GET", SAMPLE_URL).then(function (data) {
    for (let key in data) {
      let item = new cast.framework.ui.BrowseItem();
      item.entity = key;
      item.title = data[key].title;
      item.subtitle = data[key].description;
      item.image = new cast.framework.messages.Image(data[key].poster);
      item.imageType = cast.framework.ui.BrowseImageType.MOVIE;
      browseItems.push(item);
    }
  });
  return browseItems;
}

let browseContent = new cast.framework.ui.BrowseContent();
browseContent.title = "Up Next";
browseContent.items = browseItems;
browseContent.targetAspectRatio = cast.framework.ui.BrowseImageAspectRatio.LANDSCAPE_16_TO_9;

playerDataBinder.addEventListener(cast.framework.ui.PlayerDataEventType.MEDIA_CHANGED, (e) => {
  if (!e.value) return;

  // Media browse
  touchControls.setBrowseContent(browseContent);

  // Clear default buttons and re-assign
  touchControls.clearDefaultSlotAssignments();
  touchControls.assignButton(
    cast.framework.ui.ControlsSlot.SLOT_PRIMARY_1,
    cast.framework.ui.ControlsButton.SEEK_BACKWARD_30
  );
});

context.start();
