/* Certain pieces of code on this website taken/referred from:
* - http://jsfiddle.net/JMPerez/62wafrm7/
* - http://jsfiddle.net/JMPerez/0u0v7e1b/
* - code, help and guidance by Kunal Jain
* - references by official developer guidelies by Spotify API (https://beta.developer.spotify.com/)
* - authorization guide by spotify
* - Thank you to everyone
*/

//Module manipulating the DOM of index.html to add and remove html elements based on user interaction

/*Display filterButtons on webpage when user logs in
* Parameters: parsed JSON object returned by trackFeatures
* Returns: Activates activate_onclick function and passes track features to them
*/
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
* Parameters: parsed JSON object containing Track features passed on by displayFilterBar
* Returns: filtered results based on the function called when the user clicks a filter button
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
