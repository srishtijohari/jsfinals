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
