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

//List of global variables used by both, call_module.js and manipulate_dom.js

var templateSource = document.getElementById('result-template').innerHTML,
  resultsPlaceholder = document.getElementById('results'),
  loginButton = document.getElementById('btn-login'),
  FilterBar = document.getElementById('FilterBar'),
  homeScreen = document.getElementsByClassName("container"),
  textDiv = document.getElementById('text-container'),
  audio_track_features,
  display_url,
  access_token;

console.log(1);

/* Certain pieces of code on this website taken/referred from:
* - http://jsfiddle.net/JMPerez/62wafrm7/
* - http://jsfiddle.net/JMPerez/0u0v7e1b/
* - code, help and guidance by Kunal Jain
* - references by official developer guidelies by Spotify API (https://beta.developer.spotify.com/)
* - authorization guide by spotify
* - Thank you to everyone
*/

//Module manipulating the DOM of index.html to add and remove html elements based on user interaction

//Display filterButtons on webpage when user logs in
function displayFilterBar(audio_track_features) {
  //list of all the filter buttons
  let html = `<button class = "filterButton" id="allButton">All</button><br>
              <button class = "filterButton" id="danceButton">Dance</button><br>
              <button class = "filterButton" id="relaxButton">Relax</button><br>
              <button class = "filterButton" id="happyButton">Happy</button><br>
              <button class = "filterButton" id="sadButton">Sad</button><br>
              <button class = "filterButton" id="energeticButton">Energetic</button>
               `;
  let danceButton = document.getElementById('danceButton');
  let features = audio_track_features;
  FilterBar.innerHTML = html;
  activate_onclick(features);
}

/*Takes in audio track features as an argument provided by the Spotify API through the trackFeatures function
* and processes the button clicked to filter results to the parameters(levels) mentioned of the parsed
* JSON object and displays results of the songs that fit the parameters. The for loop then embeds the
* song url to the iframs src code to then save all the iframes in html_string as a string and display it
* at the end of the process through DOM.
*/
function activate_onclick(features) {

  //filter ALL (show al songs in playlist)
  allButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    for (let i = 0; i < feat.audio_features.length; i++) {
      let embed_url = feat.audio_features[i].uri;
      html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
    };
    resultsPlaceholder.innerHTML = html_string;
  });

/* filter all songs to show only songs that have high danceability. Done by fixing a range on the danceability
* parameter of a sing provided as a floating point number by the spotify API for track features
*/
  danceButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    console.log(feat.audio_features.length);
    for (let i = 0; i < feat.audio_features.length; i++) {
      if (feat.audio_features[i].danceability >= 0.750) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      }
    };
    resultsPlaceholder.innerHTML = html_string;
  });

  /* filter all songs to show only songs that have relaxing vibe. Done by fixing a range on the energy
  * parameter of a sing provided as a floating point number by the spotify API for track features
  */
  relaxButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    console.log(feat.audio_features.length);
    for (let i = 0; i < feat.audio_features.length; i++) {
      if (feat.audio_features[i].energy < 0.350) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      }
    };
    resultsPlaceholder.innerHTML = html_string;
  });

  /* filter all songs to show only songs that have happy vibe. Done by fixing a range on the valence
  * parameter of a sing provided as a floating point number by the spotify API for track features
  */
  happyButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    console.log(feat.audio_features.length);
    for (let i = 0; i < feat.audio_features.length; i++) {
      if (feat.audio_features[i].valence > 0.600) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      }
    };
    resultsPlaceholder.innerHTML = html_string;
  });

  /* filter all songs to show only songs that have melancholy vibe. Done by fixing a range on the valence
  * parameter of a sing provided as a floating point number by the spotify API for track features
  */
  sadButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    console.log(feat.audio_features.length);
    for (let i = 0; i < feat.audio_features.length; i++) {
      if (feat.audio_features[i].valence < 0.300) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      }
    };
    resultsPlaceholder.innerHTML = html_string;
  });

  /* filter all songs to show only songs that have high energy. Done by fixing a range on the energy
  * parameter of a sing provided as a floating point number by the spotify API for track features
  */
  energeticButton.addEventListener("click", function() {
    let html_string = [];
    let feat = features;
    console.log(feat.audio_features.length);
    for (let i = 0; i < feat.audio_features.length; i++) {
      if (feat.audio_features[i].energy >= 0.710) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      }
    };
    resultsPlaceholder.innerHTML = html_string;
  });

}

(function() {

  var templateSource = document.getElementById('result-template').innerHTML,
    resultsPlaceholder = document.getElementById('results'),
    loginButton = document.getElementById('btn-login'),
    FilterBar = document.getElementById('FilterBar'),
    homeScreen = document.getElementsByClassName("container"),
    textDiv = document.getElementById('text-container'),
    audio_track_features,
    display_url,
    access_token;

  function login(callback) {
    var CLIENT_ID = '7d6bf8f878644fabab3affbc7c90f958';
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

  function displayFilterBar(audio_track_features) {
    let html = `<button class = "filterButton" id="allButton">All</button><br>
                  <button class = "filterButton" id="danceButton">Dance</button><br>
                  <button class = "filterButton" id="relaxButton">Relax</button><br>
                  <button class = "filterButton" id="happyButton">Happy</button><br>
                  <button class = "filterButton" id="sadButton">Sad</button><br>
                  <button class = "filterButton" id="energeticButton">Energetic</button>
                   `;
    let danceButton = document.getElementById('danceButton');
    let features = audio_track_features;
    FilterBar.innerHTML = html;
    activate_onclick(features);
  }

  function searchArtist(query) {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let url = 'https://api.spotify.com/v1/search';
      let params = "q=query&type=artist";

      xhr.open("GET", url + '?' + params);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }

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

  function parseGetTrackId(track_response) {
    let track_id_list = []
    for (let i = 0; i < track_response.items.length; i++) {
      track_id_list.push(track_response.items[i].track.id);
    }
    return track_id_list;
  };

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

  function activate_onclick(features) {
    allButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      for (let i = 0; i < feat.audio_features.length; i++) {
        let embed_url = feat.audio_features[i].uri;
        html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
      };
      resultsPlaceholder.innerHTML = html_string;
    });

    danceButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      console.log(feat.audio_features.length);
      for (let i = 0; i < feat.audio_features.length; i++) {
        if (feat.audio_features[i].danceability >= 0.750) {
          let embed_url = feat.audio_features[i].uri;
          html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
        }
      };
      resultsPlaceholder.innerHTML = html_string;
    });

    relaxButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      console.log(feat.audio_features.length);
      for (let i = 0; i < feat.audio_features.length; i++) {
        if (feat.audio_features[i].energy < 0.350) {
          let embed_url = feat.audio_features[i].uri;
          html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
        }
      };
      resultsPlaceholder.innerHTML = html_string;
    });

    happyButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      console.log(feat.audio_features.length);
      for (let i = 0; i < feat.audio_features.length; i++) {
        if (feat.audio_features[i].valence > 0.600) {
          let embed_url = feat.audio_features[i].uri;
          html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
        }
      };
      resultsPlaceholder.innerHTML = html_string;
    });

    sadButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      console.log(feat.audio_features.length);
      for (let i = 0; i < feat.audio_features.length; i++) {
        if (feat.audio_features[i].valence < 0.300) {
          let embed_url = feat.audio_features[i].uri;
          html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
        }
      };
      resultsPlaceholder.innerHTML = html_string;
    });

    energeticButton.addEventListener("click", function() {
      let html_string = [];
      let feat = features;
      console.log(feat.audio_features.length);
      for (let i = 0; i < feat.audio_features.length; i++) {
        if (feat.audio_features[i].energy >= 0.710) {
          let embed_url = feat.audio_features[i].uri;
          html_string += '<iframe src="https://open.spotify.com/embed?uri=' + embed_url + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>';
        }
      };
      resultsPlaceholder.innerHTML = html_string;
    });

  }

})();
