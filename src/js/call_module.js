/* Certain pieces of code on this website taken/referred from:
* - http://jsfiddle.net/JMPerez/62wafrm7/
* - http://jsfiddle.net/JMPerez/0u0v7e1b/
* - code, help and guidance by Kunal Jain
* - references by official developer guidelies by Spotify API (https://beta.developer.spotify.com/)
* - authorization guide by spotify
* - Thank you to everyone
*/

//Module making calls to Spotify API

//begin the function on load of call_module.js i.e. upon loading of the website
(function() {

/* Defining the function login which sends an authorization request to the Spotify API along with user
* credentials to get access to user data on the app along with CLIENT_ID and REDIRECT_URI of the app owner
* Refer https://beta.developer.spotify.com/documentation/general/guides/authorization-guide/ for more details
* on CLIENT_ID and authorization guidelines by Spotify
*/
  function login(callback) {
    var CLIENT_ID = ''; //enter client ID here.
    var REDIRECT_URI = 'http://localhost/authorization.html';

    function getLoginURL(scopes) {
      return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&response_type=token';
    }

    var url = getLoginURL([
      'user-read-email'
    ]);

    var width = 450,
      height = 730,
      left = (screen.width / 2) - (width / 2),
      top = (screen.height / 2) - (height / 2);

    window.addEventListener("message", function(event) {
      var hash = JSON.parse(event.data);
      if (hash.type == 'access_token') {
        callback(hash.access_token);
      }
    }, false);

    var w = window.open(url,
      'Spotify',
      'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    );


  }

/* Function getUserData gets app the accessToken provided by Spotify once the user logs in and authorizes
* the app. This accessToken is then used for making further API calls sent in the header of the request.
* Parameters: the access token provided by the Spotify API upon user Authorization
* Returns: User ID of the user by parsing JSON object about user information.
*/
  function getUserData(accessToken) {
    access_token = accessToken;
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let url = 'https://api.spotify.com/v1/me';
      xhr.open("GET", url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }

/* Defining function getPlaylist to make API calls to retrieve user's current playlist
* Official Documentation on https://beta.developer.spotify.com/documentation/web-api/reference/playlists/get-a-list-of-current-users-playlists/
* Returns: Playlist ID of the user's current playlist
*/
  function getPlaylist() {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let url = 'https://api.spotify.com/v1/me/playlists';
      xhr.open("GET", url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }

  /* Defining function getTracksto make API calls to retrieve the user's tracks on a playlist using
  * user id and playlist id. User id is obtained through the getUserData function and playlist id is
  * obtained through the getPlaylist function JSON responses
  * Official Documentation on https://beta.developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
  * Parameters: user ID of user thorugh the getUserData and playlist_id through getPlaylist
  * Returns: JSON object containing all the tracks in the playlist
  */
  function getTracks(user_id, playlist_id) {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let url = 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/tracks';
      xhr.open("GET", url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }

  /* Function parseGetTrackId to create a list, track_id_list, that contains all the ids of all the songs
  * in the playlist retrieved through getPlaylist and getTracks functions
  * Returns a list track_id_list containing all the track ids.
  * Parameters: the parsed JSON object contiaing information of all tracks from getTracks
  * Returns: a list containing track IDs of all the songs in the playlist
  */
  function parseGetTrackId(track_response) {
    let track_id_list = []
    for (let i = 0; i < track_response.items.length; i++) {
      track_id_list.push(track_response.items[i].track.id);
    }
    return track_id_list;
  };

  /* Defining function getTrackImages to create initial landing page after login which displays
  * all songs in the user's playlist
  * Similar to when the user clicks All filter button
  * Goes through all track ids, attackes it to iframe src and creates a string html_string.
  * This string retrieves the playable buttons of the songs present in the user's playlists
  * and presents them in the results div in the html page.
  * Also converts text of login page to blank.
  * Parameters: parsed JSON response provided by getTracks
  * Returns: mini players on the HTML page to play songs
  */
  function getTrackImages(track_response) {
    let html_string = [];
    for (let i = 0; i < track_response.items.length; i++) {
      let img_url = track_response.items[i].track.album.images[0].url;
      let embed_url = track_response.items[i].track.external_urls.spotify;
      html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';

    }
    resultsPlaceholder.innerHTML = html_string;
    textDiv.innerHTML = " ";
  };

  /* Defining function trackFeatures to make API calls to retrieve features from songs to create parameters
  * to process for filterButtons.
  * Official Documentation on https://beta.developer.spotify.com/documentation/web-api/reference/tracks/get-several-audio-features/
  * Parameters: track list returned by parseGetTrackId
  * Returns: parsed JSON object of all track features
  */
  function trackFeatures(final_track_list) {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let url = 'https://api.spotify.com/v1/audio-features';
      xhr.open("GET", url + '?ids=' + final_track_list);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }

/* Main function executed when the user clicks on the Login button
* Begins with login button and is embedded to call one function from the other to get all the
* information required for the app like user id, playlist, tracks, track features and then
* filtering out songs based on user clicking filter options.
* DOM manipulation to display results of filtering options is in manipulate_dom.js
*/
  loginButton.addEventListener('click', function() {
    login(function(accessToken) {
      getUserData(accessToken)
        .then(function(response) {
          loginButton.style.display = 'none';
          response = JSON.parse(response);
          var user_id = response.id;
          getPlaylist()
            .then(function(play_response) {
              play_response = JSON.parse(play_response);
              var playlist_id = play_response.items[0].id;

              getTracks(user_id, playlist_id)
                .then(function(track_response) {
                  track_response = JSON.parse(track_response);
                  let final_track_list = parseGetTrackId(track_response);
                  getTrackImages(track_response);

                  trackFeatures(final_track_list)
                    .then(function(features_response) {
                      audio_track_features = JSON.parse(features_response);
                      displayFilterBar(audio_track_features);
                    });
                });
            });

        });
    });
  });

})();
