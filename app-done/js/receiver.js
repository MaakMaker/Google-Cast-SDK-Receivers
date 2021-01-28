const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

//Media Sample API Values
// const SAMPLE_URL = "/content.json";
const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};

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

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, (request) => {
  if (request.media && !request.media.contentId) {
    request.media.contentId = request.media.contentId;
  }
  let metadata = new cast.framework.messages.GenericMediaMetadata();
  let streamurl = request.media.contentId;
  // let drm = request.media.customData.licenseUrl;
  // streamurl = request.media.contentUrl;
  // // let streamurl =
  // //   "https://npfltv.akamaized.net/media/movies/hybrikBulk_matchday6_wikkitouristsvsjigawagoldenstars_bb4bf3829496347492ff398e24f4ce37/stream.m3u8";

  // castDebugLogger.error(" >>> Testing <<< ");

  if (streamurl.lastIndexOf(".mpd") >= 0) {
    request.media.contentType = StreamType.DASH;
    if (drm !== "") {
      // castDebugLogger.error(" >>> Here is licesed  <<< ");
      context
        .getPlayerManager()
        .setMediaPlaybackInfoHandler(async (loadRequest, playbackConfig) => {
          if (request.media.customData && request.media.customData.licenseUrl) {
            playbackConfig.licenseUrl = await request.media.customData.licenseUrl;
            playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
            // playbackConfig.licenseRequestHandler = (requestInfo) => {
            //   requestInfo.withCredentials = true;
            // };
          }
          return playbackConfig;
        });
    }
  } else if (streamurl.lastIndexOf(".m3u8") >= 0) {
    castDebugLogger.error(" >>> Here is HLS <<< ");
    request.media.contentType = StreamType.HLS;
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
  }

  request.media.metadata = metadata;

  return request;
});

context.start();
