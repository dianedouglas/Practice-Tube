$(document).ready(function(){

var searchTerm;
function search(query, pageToken) {
    // Use the JavaScript client library to create a search.list() API call.
    if(pageToken) {    
      var request = gapi.client.youtube.search.list({
          part: 'snippet',
          q: query,
          pageToken: pageToken,
          maxResults: 25
      });
    }else {    
      var request = gapi.client.youtube.search.list({
          part: 'snippet',
          q: query,
          maxResults: 25
      });
    }

    
    // Send the request to the API server,
    // and invoke onSearchRepsonse() with the response.
    request.execute(onSearchResponse);
}

// Called automatically with the response of the YouTube API request.
function onSearchResponse(response) {
    $('#results').empty();
    response.items.forEach(function(video){
      if (video.id.videoId) { //don't show channels etc.
        console.log(video.id.videoId);
        console.log(video.snippet.title);
        var currentVideoId = video.id.videoId;
        var url = video.snippet.thumbnails.default.url;
        var imgTag = '<img src="' + url +'">';
        var imgPlusDivWithId = '<div class="videoThumb" id="' + currentVideoId + '">' + imgTag + '</div>'
        console.log(imgPlusDivWithId);
        $('#results').append(imgPlusDivWithId);
        $('.videoThumb').last().click(function(){
          var videoIdToPlay = $(this).attr('id');
          loadVideoById(videoIdToPlay);
        });
      };
    });
    $('#pager').empty();
    
    if (response.prevPageToken) {
      $('#pager').append('<a class="prev" id="' + response.prevPageToken + '">Prev</a>')
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

// (function() {
  // Retrieve your client ID from the Google Developers Console at
  // https://console.developers.google.com/.
  var OAUTH2_CLIENT_ID = '1070803394366-and4mdf2i6p63bql38m81klajnshep25.apps.googleusercontent.com';
  var OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  var ONE_MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;

  // Keep track of the currently authenticated user's YouTube channel ID.
  var channelId;

  // For information about the Google Chart Tools API, see:
  // https://developers.google.com/chart/interactive/docs/quick_start
  google.load('visualization', '1.0', {'packages': ['corechart']});

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

  // Load the client interfaces for the YouTube Analytics and Data APIs, which
  // are required to use the Google APIs JS client. More info is available at
  // https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
  function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
      gapi.client.load('youtubeAnalytics', 'v1', function() {
        // After both client interfaces load, use the Data API to request
        // information about the authenticated user's channel.
        search('lord of the rings');
        // getUserChannel();
      });
    });
  }

  // This helper method displays a message on the page.
  function displayMessage(message) {
    $('#message').text(message).show();
  }

  // This helper method hides a previously displayed message on the page.
  function hideMessage() {
    $('#message').hide();
  }

// })();

  $('#search').click(function(){
    searchTerm = $('#find-videos').val();
    search(searchTerm);
  });
});