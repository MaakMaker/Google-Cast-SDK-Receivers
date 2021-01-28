const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

const StreamType = {
  DASH: "application/dash+xml",
  HLS: "application/x-mpegurl",
};
const TEST_STREAM_TYPE = StreamType.HLS;

// Debug Logger
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const LOG_TAG = "MyAPP.LOG";

// Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
castDebugLogger.setEnabled(true);

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

  let streamurl =
    "https://npfltv.akamaized.net/media/movies/hybrikBulk_day1_akwaunitedvsdakkadafc_fbbb89951e383c2f86c71c8a5f49674e/stream.m3u8";

  streamurl = request.media.contentUrl;
  request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
  request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
  let metadata = new cast.framework.messages.GenericMediaMetadata();
  metadata.subtitle = "Sub-Title";
  metadata.title = "Title";
  metadata.contentId = streamurl;
  request.media.metadata = metadata;

  return request;
});

context.start();
