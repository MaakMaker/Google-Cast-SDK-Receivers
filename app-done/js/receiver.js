const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

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

  // let streamurl = request.media.contentId;
  // let drm = request.media.customData.licenseUrl;

  request.media.contentUrl = item.stream.hls_ts;
  request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.TS;
  request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.TS;
  let metadata = new cast.framework.messages.GenericMediaMetadata();
  metadata.title = request.media.metadata.channel_title;
  metadata.subtitle = "Sub-Title";
  metadata.title = "Title";
  request.media.contentId = streamurl;
  request.media.metadata = metadata;

  return request;
});

context.start();
