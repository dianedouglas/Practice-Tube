//////////////////// GLOBALS ////////////////////
// variable setup to hold video query string. used with next/prev page requests.
var searchTerm;
// holds iframe player, called by all playback functions.
var player;
// loop points. set by 'getLoopStartTime' and 'getLoopEndTime' on click, used in startLooping function.
// this function starts and restarts loop, it is called repeatedly from various places
// so it does not seem needed to pass in a local copy of start/end time. 
// these should be referenced from anywhere and changed from anywhere.
var startTime;
var endTime;

// keeps track of state of looper and half speed on/off
var loopingOn = false;
var halfOn = false;
/////////////////////////////////////////////////

//////////////////// YOUTUBE IFRAME PLAYER & PLAYBACK FUNCTIONS ////////////////////
function onYouTubeIframeAPIReady() {
  player = new YT.Player('existing-iframe-example', {
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
  });
}
function loadVideoById(id) {
  player.cueVideoById({'videoId': id});
  player.playVideo();
}
function getLoopStartTime() {
  startTime = player.getCurrentTime();
}
function getLoopEndTime() {
  endTime = player.getCurrentTime();
  startLooping();
}
function startLooping() {
  var currentVideoId = player.getVideoData()['video_id'];
  player.cueVideoById({'videoId': currentVideoId,
    'startSeconds': startTime,
    'endSeconds': endTime});
  player.playVideo();
  debugger;
  if (halfOn) {
    player.setPlaybackRate('.5');
  } else {
    player.setPlaybackRate('1');
  }
  if ($('.loopSwitch').hasClass('clicked') === false) {
    $('.loopSwitch').addClass('clicked');
    loopingOn = true;
  };
}
function resumePlayback() {
  var duration = player.getDuration();
  var currentTime = player.getCurrentTime();
  var currentVideoId = player.getVideoData()['video_id'];
  player.cueVideoById({'videoId': currentVideoId,
    'startSeconds': currentTime,
    'endSeconds': duration});
  player.playVideo();
}
function back10() {
  var currentTime = player.getCurrentTime();
  player.seekTo(currentTime - 10);
}
function back30() {
  var currentTime = player.getCurrentTime();
  player.seekTo(currentTime - 30);
}
function onPlayerReady(event) {
  document.getElementById('existing-iframe-example').style.borderColor = '#FF6D00';
}
function onPlayerStateChange(event) {
  if (event.data == 0) {
    startLooping();
  }
}
function halfSpeed(){
  player.setPlaybackRate('.5');
}
function normalSpeed(){
  player.setPlaybackRate('1');
}
/////////////////////////////////////////////////


//////////////////// ATTACH CLICK HANDLERS ON DOCUMENT READY ////////////////////
$(document).ready(function(){
  // attach click handler to search button
  $('#search').submit(function(event){
    event.preventDefault();
    searchTerm = $('#find-videos').val();
    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    search(searchTerm);
  });

  // load iframe tag
  var tag = document.createElement('script');
  tag.id = 'iframe-demo';
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // attach click handlers to switches.
  $('.loopSwitch').click(function(){
    if (!loopingOn) {
      startLooping();
      $(this).addClass('clicked');
      loopingOn = true;
    } else {
      resumePlayback();
      $(this).removeClass('clicked');
      loopingOn = false;
    }
  });
  $('.speedSwitch').click(function(){
    if (!halfOn) {
      halfSpeed();
      $(this).addClass('clicked');
      halfOn = true;
    } else {
      normalSpeed();
      $(this).removeClass('clicked');
      halfOn = false;
    }
  });
});
/////////////////////////////////////////////////

//////////////////// SEARCH FOR VIDEOS & DISPLAY RESULTS ////////////////////
function search(query, pageToken) {
  // create search.list youtube data API call with or without page token.
  if(pageToken) {    
    var request = gapi.client.youtube.search.list({
        part: 'snippet',
        q: query,
        pageToken: pageToken,
        maxResults: 8,
        type: 'video'
    });
  }else {    
    var request = gapi.client.youtube.search.list({
        part: 'snippet',
        q: query,
        maxResults: 8,
        type: 'video'
    });
  }
  // execute request, send to API server,
  // when response comes back, call 'onSearchResponse' function.
  request.execute(onSearchResponse);
}

// Display results of search and pagers.
function onSearchResponse(response) {
    $('#results').empty();
    var rowCounter = -1;
    $('#results').append('<div class="row">');
    console.log(response.items);
    response.items.forEach(function(video){
      // if we're inside a row
      if (video.id.videoId) { //don't show channels etc.
        rowCounter++;
        if (rowCounter < 4) {
          var currentVideoId = video.id.videoId;
          var url = video.snippet.thumbnails.medium.url;
          var imgTag = '<img class="img-responsive portfolio-item" src="' + url +'">';
          var imgPlusDivWithId = '<div class="col-sm-3 col-xs-6 videoThumb" id="' + currentVideoId + '">' + imgTag + '</div>';
          $('#results').append(imgPlusDivWithId);
          $('.videoThumb').last().click(function(){
            var videoIdToPlay = $(this).attr('id');
            loadVideoById(videoIdToPlay);
            $("html, body").animate({ scrollTop: 15 }, "slow");
          });
        } else { // if we've reached the end of a row
          // reset counter to 0.
          rowCounter = 0;
          // add a closing row div, start new one.
          $('#results').append('</div>');
          $('#results').append('<div class="row">');
          var currentVideoId = video.id.videoId;
          var url = video.snippet.thumbnails.medium.url;
          var imgTag = '<img class="img-responsive portfolio-item" src="' + url +'">';
          var imgPlusDivWithId = '<div class="col-sm-3 col-xs-6 videoThumb" id="' + currentVideoId + '">' + imgTag + '</div>';
          $('#results').append(imgPlusDivWithId);
          $('.videoThumb').last().click(function(){
            var videoIdToPlay = $(this).attr('id');
            loadVideoById(videoIdToPlay);
            $("html, body").animate({ scrollTop: 15 }, "slow");
          });
        };
      };
    });
    $('#pager').empty();
    if (response.prevPageToken) {
      $('#pager').append('<a class="prev" id="' + response.prevPageToken + '">Prev</a> | ')
    };
    $('.prev').click(function(){
      var pageToken = $(this).attr('id');
      search(searchTerm, pageToken);
    });
    if (response.nextPageToken) {
      $('#pager').append('<a class="next" id="' + response.nextPageToken + '">Next</a>')
    };
    $('.next').click(function(){
      var pageToken = $(this).attr('id');
      search(searchTerm, pageToken);
    });    
}
/////////////////////////////////////////////////

//////////////////// AUTH & LOAD YOUTUBE API WHEN PAGE LOADS ////////////////////
(function() {
  // set up youtube data api info
  var OAUTH2_CLIENT_ID = '1070803394366-and4mdf2i6p63bql38m81klajnshep25.apps.googleusercontent.com';
  var OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  // Upon loading, the Google APIs JS client automatically invokes this callback.
  // See https://developers.google.com/api-client-library/javascript/features/authentication 
  window.onJSClientLoad = function() {
    gapi.auth.init(function() {
      window.setTimeout(checkAuth, 1);
    });
  };

  // Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
  // If the currently logged-in Google Account has previously authorized
  // the client specified as the OAUTH2_CLIENT_ID, then the authorization
  // succeeds with no user intervention. Otherwise, it fails and the
  // user interface that prompts for authorization needs to display.
  function checkAuth() {
    gapi.auth.authorize({
      client_id: OAUTH2_CLIENT_ID,
      scope: OAUTH2_SCOPES,
      immediate: false
    }, handleAuthResult);
  }

  // Handle the result of a gapi.auth.authorize() call.
  function handleAuthResult(authResult) {
    if (authResult) {
      // Authorization was successful. Hide authorization prompts and show
      // content that should be visible after authorization succeeds.
      $('.pre-auth').hide();
      $('.post-auth').show();

      loadAPIClientInterfaces();
    } else {
      // Authorization was unsuccessful. Show content related to prompting for
      // authorization and hide content that should be visible if authorization
      // succeeds.
      $('.post-auth').hide();
      $('.pre-auth').show();

      // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
      // client flow. The current function is called when that flow completes.
      $('#login-link').click(function() {
        gapi.auth.authorize({
          client_id: OAUTH2_CLIENT_ID,
          scope: OAUTH2_SCOPES,
          immediate: false
        }, handleAuthResult);
      });
    }
  }

  // Load the client interfaces for the YouTube Data API if auth successful.
  function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
        search('lord of the rings');
    });
  }

})();