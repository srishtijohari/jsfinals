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
