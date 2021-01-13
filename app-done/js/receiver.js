const context = cast.framework.CastReceiverContext.getInstance();
context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
const playerManager = context.getPlayerManager();
const playbackConfig = new cast.framework.PlaybackConfig();
playbackConfig.licenseUrl = "https://widevine-proxy.appspot.com/proxy";
playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
playbackConfig.licenseRequestHandler = (requestInfo) => {
  requestInfo.headers = {
    "Content-Type": "application/dash+xml",
    customdata: "https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd",
  };
  return playbackConfig;
};
context.start({ playbackConfig: playbackConfig });

// const context = cast.framework.CastReceiverContext.getInstance();
// const playerManager = context.getPlayerManager();

// const playbackConfig = new cast.framework.PlaybackConfig();
// Customize the license url for playback
// playbackConfig.licenseUrl =
// "https://wv.service.expressplay.com/hms/wv/rights/?ExpressPlayToken=BQAAABJ1Kb0AJGFmZWI1ZGY0LTE5N2MtNDMxZi1iYzk2LTEzOWRhYWI4YjM5ZQAAAGAAZYMrGC7H4sssZAqOxLIoIs4QdqDXjEuB9PPgpcDlN6Vlz16BaCYxYjMTjK8dcO7SeCNiJyG4fbusNnYGCJZLmBaBph3E3fwEUvhp66wNH0aXZ7aN-_QQ3ITM6r8brRqeoLyA5eP9kZaaqnWoj3bVUdujCA";

// playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
// playbackConfig.licenseRequestHandler = (requestInfo) => {
//   requestInfo.withCredentials = true;
// };

// Update playback config licenseUrl according to provided value in load request.

// context.getPlayerManager().setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
//   if (loadRequest.media.customData && loadRequest.media.customData.licenseUrl) {
//     playbackConfig.licenseUrl = loadRequest.media.customData.licenseUrl;
//   }
//   return playbackConfig;
// });

// context.start();
// context.start({ playbackConfig: playbackConfig });

// const playbackConfig = new cast.framework.PlaybackConfig();

// request.media.contentUrl = item.stream.dash;
// request.media.contentType = "application/dash+xml";

// const SAMPLE_URL = "./content.json";

// function makeRequest(method, url) {
//   return new Promise(function (resolve, reject) {
//     let xhr = new XMLHttpRequest();
//     xhr.open(method, url);
//     xhr.onload = function () {
//       if (this.status >= 200 && this.status < 300) {
//         resolve(JSON.parse(xhr.response));
//       } else {
//         reject({
//           status: this.status,
//           statusText: xhr.statusText,
//         });
//       }
//     };
//     xhr.onerror = function () {
//       reject({
//         status: this.status,
//         statusText: xhr.statusText,
//       });
//     };
//     xhr.send();
//   });
// }

// playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, (request) => {
//   return new Promise((resolve, reject) => {
//     // Fetch content repository by requested contentId
//     makeRequest("GET", SAMPLE_URL).then(function (data) {
//       let item = data[request.media.contentId];
//       if (!item) {
//         // Content could not be found in repository
//         reject();
//       } else {
//         // Adjusting request to make requested content playable
//         request.media.contentUrl = item.stream.dash;
//         request.media.contentType = "application/dash+xml";

//         // Customize the license url for playback
//         playbackConfig.licenseUrl =
//           "https://wv.service.expressplay.com/hms/wv/rights/?ExpressPlayToken=BQAAABJ1Kb0AJGFmZWI1ZGY0LTE5N2MtNDMxZi1iYzk2LTEzOWRhYWI4YjM5ZQAAAGAAZYMrGC7H4sssZAqOxLIoIs4QdqDXjEuB9PPgpcDlN6Vlz16BaCYxYjMTjK8dcO7SeCNiJyG4fbusNnYGCJZLmBaBph3E3fwEUvhp66wNH0aXZ7aN-_QQ3ITM6r8brRqeoLyA5eP9kZaaqnWoj3bVUdujCA";
//         playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
//         playbackConfig.licenseRequestHandler = (requestInfo) => {
//           requestInfo.withCredentials = true;
//         };

//         // Update playback config licenseUrl according to provided value in load request.
//         context.getPlayerManager().setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
//           if (loadRequest.media.customData && loadRequest.media.customData.licenseUrl) {
//             playbackConfig.licenseUrl = loadRequest.media.customData.licenseUrl;
//           }
//           return playbackConfig;
//         });

//         // Add metadata
//         let metadata = new cast.framework.messages.GenericMediaMetadata();
//         metadata.title = item.title;
//         metadata.subtitle = item.author;

//         request.media.metadata = metadata;

//         // Resolve request
//         resolve(request);
//       }
//     });
//   });
// });

// Debug Logger
// const castDebugLogger = cast.debug.CastDebugLogger.getInstance();

// // Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
// castDebugLogger.setEnabled(true);

// // Set verbosity level for Core events.
// castDebugLogger.loggerLevelByEvents = {
//   "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
//   "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
// };

// context.start();

// context.start({ playbackConfig: playbackConfig });
