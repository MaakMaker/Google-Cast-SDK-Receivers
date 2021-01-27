const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

//Media Sample API Values
const SAMPLE_URL = "/content.json";
const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};

// Debug Logger
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = "MyAPP.LOG";

// Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
// castDebugLogger.setEnabled(true);

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

  let streamurl = request.media.contentId;
  castDebugLogger.error(
    " >>> streamurl.lastIndexOf Streamurl <<< ",
    streamurl.lastIndexOf("/mpd") >= 0
  );
  castDebugLogger.error(
    " >>> streamurl.lastIndexOf Streamurl <<< ",
    streamurl.lastIndexOf(".mpd") >= 0
  );
  castDebugLogger.error(
    " >>> streamurl.lastIndexOf Streamurl <<< ",
    streamurl.lastIndexOf("/Manifest") >= 0
  );
  castDebugLogger.error(
    " >>> streamurl.lastIndexOf Streamurl <<< ",
    streamurl.lastIndexOf("/mp4") >= 0
  );

  if (
    streamurl.lastIndexOf("/mpd") >= 0 ||
    streamurl.lastIndexOf(".mpd") >= 0 ||
    streamurl.indexOf("/Manifest") >= 0 ||
    streamurl.lastIndexOf(".mp4") >= 0
  ) {
    request.media.contentType = StreamType.DASH;
    castDebugLogger.error(" >>> Here is Dash <<< ");
    context.getPlayerManager().setMediaPlaybackInfoHandler(async (loadRequest, playbackConfig) => {
      castDebugLogger.error(" >>> req <<< ", loadRequest);
      if (request.media.customData && request.media.customData.licenseUrl) {
        playbackConfig.licenseUrl = await request.media.customData.licenseUrl;
        playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
        // playbackConfig.licenseRequestHandler = (requestInfo) => {
        //   requestInfo.withCredentials = true;
        // };
      }

      return playbackConfig;
    });
  } else if (streamurl.lastIndexOf(".m3u8") >= 0) {
    request.media.contentType = StreamType.HLS;
    castDebugLogger.error(" >>> Here is HLS <<< ");
    request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.MPEG2_TS;
    request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.MPEG2_TS;
  }

  let metadata = new cast.framework.messages.GenericMediaMetadata();
  metadata.title = request.media.metadata.channel_title;
  // metadata.subtitle = request.media.metadata.channel_no;
  // request.media.contentType = StreamType.DASH;
  request.media.metadata = metadata;

  return request;
});

context.start();
