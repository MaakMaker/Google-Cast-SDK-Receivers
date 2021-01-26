window.onload = function () {
  cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.ERROR);
  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.ERROR);
  var mediaElement = document.getElementById("vid");

  const playerManager = context.getPlayerManager();
  // window.mediaManager = new cast.receiver.MediaManager(mediaElement);//

  window.defaultOnLoad = mediaManager.onLoad.bind(mediaManager);
  mediaManager.onLoad = function (event) {
    if (window.player !== null) {
      console.log("unloading the player");
      player.unload();
      window.player = null;
    }
    var data_received = "";
    if (event.data["media"] && event.data["media"]["contentId"]) {
      if (
        event.data["media"]["contentId"].endsWith(".m3u8") ||
        event.data["media"]["contentId"].endsWith(".mpd") ||
        event.data["media"]["contentId"].endsWith(".mp4") ||
        event.data["media"]["contentId"].endsWith("/mpd")
      ) {
        var streamurl = event.data["media"]["contentId"];
        if (event.data.media.metadata.channel_title) {
          document.getElementById("channel_title").innerHTML =
            event.data.media.metadata.channel_title;
          document.getElementById("titleText").innerHTML = event.data.media.metadata.channel_title;
          document.getElementById("channel_logo").src = event.data.media.metadata.channel_logo;
        }
      } else {  
        data_received = JSON.parse(event.data["media"]["contentId"]);
        var streamurl = data_received.dash;
        document.getElementById("channel_title").innerHTML = data_received.title;
        document.getElementById("titleText").innerHTML = data_received.title;
        document.getElementById("channel_logo").src = data_received.poster;
      }

      var host = new cast.player.api.Host({
        mediaElement: mediaElement,
        url: streamurl,
      });

      var initStart = event.data["media"]["currentTime"] || 0;
      var autoplay = event.data["autoplay"] || true;
      var protocol = null;
      if (streamurl.lastIndexOf(".m3u8") >= 0) {
        protocol = cast.player.api.CreateHlsStreamingProtocol(
          host,
          cast.player.api.HlsSegmentFormat.MPEG2_TS
        );

        setTimeout(function () {
          $("#splash_screen").hide();
          $("#player_screen").show();
        }, 5000);
      } else if (
        streamurl.lastIndexOf("/mpd") >= 0 ||
        streamurl.lastIndexOf(".mpd") >= 0 ||
        streamurl.indexOf("/Manifest") >= 0 ||
        streamurl.lastIndexOf(".mp4") >= 0
      ) {
        if (streamurl.lastIndexOf("/mpd") >= 0 || streamurl.lastIndexOf(".mpd") >= 0) {
          // MPEG-DASH
          protocol = cast.player.api.CreateDashStreamingProtocol(host);
        } else if (streamurl.indexOf("/Manifest") >= 0 || streamurl.lastIndexOf(".mp4") >= 0) {
          // Smooth Streaming
          console.log("=== SMOOTH ===");
          protocol = cast.player.api.CreateSmoothStreamingProtocol(host);
        }

        if (
          typeof data_received.drm != "undefined" &&
          typeof data_received.drm.widevine != "undefined"
        ) {
          host.licenseUrl = data_received.drm.widevine.LA_URL;

          host.protectionSystem = cast.player.api.ContentProtection.WIDEVINE;
        } else {
          if (
            event.data.media &&
            event.data.media.customData &&
            event.data.media.customData["licenseUrl"] !== null
          ) {
            host.licenseUrl = event.data.media.customData["licenseUrl"];
            host.protectionSystem = cast.player.api.ContentProtection.WIDEVINE;
          }
        }
      }

      mediaElement.autoplay = autoplay; // Make sure autoplay gets set

      host.onError = function (errorCode) {
        console.log("Fatal Error - " + errorCode);
        if (window.player) {
          console.log("unloading player");
          window.player.unload();
          window.player = null;
        }
      };
      // host.processManifest = function (manifest) {
      //     var manifest_modified = manifest.replace("codecs=\"avc1.640032", "codecs=\"avc1.64001E");
      //     return manifest_modified;
      // };

      if (protocol !== null) {
        console.log("Starting Media Player Library");
        window.player = new cast.player.api.Player(host); //hd spot

        window.player.load(protocol, initStart);
        // load player casted
        setTimeout(function () {
          $("#splash_screen").hide();
          $("#player_screen").show();
        }, 5000);
      } else {
        console.log("using default handler");
        window.defaultOnLoad(event); // do the default process
        // load player casted
        setTimeout(function () {
          $("#splash_screen").hide();
          $("#player_screen").show();
        }, 5000);
      }
    } else {
      console.log("not content");
    }
  };

  window.player = null;
  console.log("013 Application is ready, starting system");
  // // manages the cast session, senders, sending custom messages, and global system events
  const context = cast.framework.CastReceiverContext.getInstance();

  // window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance(); //
  castReceiverManager.onSenderDisconnected = function (event) {
    console.log("Received Sender Disconnected event: " + event.data);
    if (window.castReceiverManager.getSenders().length == 0) {
      window.close();
    }
  };

  castReceiverManager.start();
  var vid = document.getElementById("vid");

  var isPlaying = function (e) {
    $("#player_screen").removeClass("cc-pause");
    $("#player_screen").addClass("cc-play");
    $("#titleText").hide();
  };
  // Pause event
  var onPause = function (e) {
    $("#player_screen").removeClass("cc-play");
    $("#player_screen").addClass("cc-pause");
    $("#titleText").show();
  };

  vid.addEventListener("playing", isPlaying, false);
  vid.addEventListener("pause", onPause, false);

  vid.ontimeupdate = function () {
    var percentage = (vid.currentTime / vid.duration) * 100;
    $("#custom-seekbar span").css("width", percentage + "%");
    var startTime = 0,
      start = 0,
      stop = 0,
      stopTime = 0;
    start = Number(vid.currentTime);
    stop = Number(vid.duration);
    if (Math.floor(start / 3600) > 0) {
      startTime =
        "" +
        Math.floor(start / 3600) +
        ":" +
        Math.floor((start % 3600) / 60) +
        ":" +
        Math.floor((start % 3600) % 60);
    } else if (Math.floor((start % 3600) / 60) > 0 && Math.floor(start / 3600) < 1) {
      startTime = "" + Math.floor((start % 3600) / 60) + ":" + Math.floor((start % 3600) % 60);
    } else if (Math.floor((start % 3600) % 60) > 0 && Math.floor((start % 3600) / 60) < 1) {
      startTime = "" + Math.floor((start % 3600) % 60);
    }
    if (Math.floor(stop / 3600) > 0) {
      stopTime =
        "" +
        Math.floor(stop / 3600) +
        ":" +
        Math.floor((stop % 3600) / 60) +
        ":" +
        Math.floor((stop % 3600) % 60);
    } else if (Math.floor((stop % 3600) / 60) > 0 && Math.floor(stop / 3600) < 1) {
      stopTime = "" + Math.floor((stop % 3600) / 60) + ":" + Math.floor((stop % 3600) % 60);
    } else if (Math.floor((stop % 3600) % 60) > 0 && Math.floor((stop % 3600) / 60) < 1) {
      stopTime = "" + Math.floor((stop % 3600) % 60);
    }
  };
};

$("#custom-seekbar").on("click", function (e) {
  var offset = $(this).offset();
  var left = e.pageX - offset.left;
  var totalWidth = $("#custom-seekbar").width();
  var percentage = left / totalWidth;
  var vidTime = vid.duration * percentage;
  vid.currentTime = vidTime;
});

function level2label(obj, index) {
  if (obj && obj.levels.length - 1 >= index) {
    var level = obj.levels[index];
    if (level.name) {
      return level.name;
    } else {
      if (level.height) {
        return level.height + "p";
      } else {
        if (level.bitrate) {
          return Math.round(level.bitrate / 1024) + "kb";
        } else {
          return "260p-720p";
        }
      }
    }
  }
}

function updateLevelInfo() {
  if (!hls.levels) {
    return;
  }
  var i = '<li class="quality-lable">Quality</li>';
  var button_template = '<li class="quality-type ';
  var button_enabled = 'active " ';
  var button_disabled = '" ';

  var html1 = button_template;
  if (hls.autoLevelEnabled) {
    html1 += button_enabled;
  } else {
    html1 += button_disabled;
  }

  html1 +=
    ' onclick="hls.currentLevel=-1"><i class="fa fa-check"></i><i class="fa fa-circle color-red"></i> Auto</li>';
  for (var i = 0; i < hls.levels.length; i++) {
    html1 += button_template;
    if (hls.currentLevel === i) {
      if (hls.autoLevelEnabled) {
        html1 += ' current" ';
      } else {
        html1 += 'active current" ';
      }
    } else {
      html1 += button_disabled;
    }
    html1 +=
      ' onclick="hls.currentLevel=' +
      i +
      '"> <i class="fa fa-check"></i><i class="fa fa-circle color-red"></i>' +
      level2label(hls, i) +
      "</li>";
  }
  $("#slt-player-quality ul").html(html1);
}
