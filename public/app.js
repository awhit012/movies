window.onload = function () {
  // when the window loads, create the App class,
  // save it in a variable, and execute the following functions on this instance of the class.
  var myApp = new App();
  myApp.addEventListenerToSubmitButton();
  myApp.addEventListenerToGetFavorites();
  myApp.addEventListenerToMovieTitles();
  myApp.addEventListenerToFavoriteButtons();
};

var App = function(){
  this.searchResults;
  this.myMovies = [];
  this.currentMovie;
  this.mainDiv = document.getElementById('main');
  this.spinner = new Spinner(); // This provides a spinner when things are loading
  this.favoritePage = false; // when we are rendering our favorites, things behave slightly differently
};



// XML HELPERS

App.prototype.XMLHelper = function(method, url, successFunction, data, contentType){
  this.spinner.spin(); // Start the spinner
  this.mainDiv.appendChild(this.spinner.el); // Put it on the page

  var xhr = new XMLHttpRequest();
  xhr.open(method, encodeURI(url), true); // This opens a connection with our API
  var self = this;
  if (contentType){
    xhr.setRequestHeader('Content-Type', 'application/json');
  }
  xhr.onload = function(){ // When the request has loaded, excecute this function
    self.xhrOnload(xhr, successFunction); // this takes the request and a function as params
  };
  if (data){
    xhr.send(data); // this happens with POST requests
  }
  else { xhr.send(); }
};

App.prototype.xhrOnload = function(xhr, successFunction){
  if (xhr.status === 200){ // Success!
    this[successFunction](xhr.responseText); // excecute that function with the response as an argument
    this.spinner.stop();
  }
  else { alert('Request failed.  Returned status of ' + xhr.status); } // Failure!
};

// GET favorites from backend

App.prototype.addEventListenerToGetFavorites = function () {
  var link = document.getElementById("get-favorites");
  link.addEventListener("click", this.getFavorites.bind(this)); // bind(this) makes it so 'this' in getFavorites is still the App object
};

App.prototype.getFavorites = function () {
  this.XMLHelper('GET', 'http://localhost:4567/favorites', 'getFavoritesSuccess');
};

App.prototype.getFavoritesSuccess = function(response){
  this.favoritePage = true;
  this.mainDiv.innerHTML = ""; // clear the div
  var favs = JSON.parse(response); // favs is now a JS object of name, imdbID pairs
  this.sendFavoritesToAPI(favs);
};

App.prototype.sendFavoritesToAPI = function (favs) {
  var self = this;
  var key;
  for (key in favs){
    self.getMovieDetails(favs[key]); // for each movie's id, get the details of this movie
  }
};

// GETs Results of search from OMDBAPI

App.prototype.addEventListenerToSubmitButton = function(){
  var submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", this.getResults.bind(this));
};

App.prototype.getResults = function(){
  event.preventDefault();
  var input = document.getElementById("search-txt").value; // get the search value from the box
  var url = 'http://www.omdbapi.com/?s=' + input + '&y=&plot=short&r=json'; // inject that value into the url to hit
  this.XMLHelper('GET', url, 'searchSuccess'); // go get those results!
};

App.prototype.searchSuccess = function(responseText){
  this.myMovies = []; // clear out myMovies array
  this.searchResults = JSON.parse(responseText).Search; // searchResults is now an array of JS objects each representing a movie
  this.createMovies();
  this.addMoviesToDOM();

};

// We want these JS objects to be Movie objects of our own design.
// This method makes them into Movie objects and pushes them to our App.myMovies array
App.prototype.createMovies = function() {
  var self = this;
  var i;
  for (i = 0; i < this.searchResults.length; i+= 1){
    self.myMovies.push(new Movie(this.searchResults[i], i));
  }
};

App.prototype.addMoviesToDOM = function(){
  var i;
  this.mainDiv.innerHTML = ""; // clear the page
  for (i = 0; i < this.myMovies.length; i+= 1){
    this.mainDiv.innerHTML += this.myMovies[i].html; // add each Movie's html to the page
  }
};

// MOVIE SHOW PAGES

App.prototype.addEventListenerToMovieTitles = function(){
  var self = this;
  this.mainDiv.addEventListener('click', function(event) { // When a Title is clicked...
    if (event.target.className === 'movie'){
      var movie = self.myMovies[event.target.id]; // figure out which one...
      self.getMovieDetails(movie.stats.imdbID);
    }
  });
};

App.prototype.getMovieDetails = function(imdbID){
  var url = 'http://www.omdbapi.com/?i=' + imdbID + '&plot=short&r=json';
  this.XMLHelper('GET', url, 'detailsSuccess'); // Go get details of that movie
};

App.prototype.detailsSuccess = function(responseText){
  this.currentMovie = new Movie(JSON.parse(responseText)); // create new Movie object with JS object that is parsed from the JSON response
  this.renderMoviePage();
};

App.prototype.renderMoviePage = function(){
  this.favoritePage ? (this.mainDiv.innerHTML += this.currentMovie.html) : this.mainDiv.innerHTML = this.currentMovie.html; // if we are rendering the favorites, keep adding to the dom, else, clear the dom and just add the one movie as a show page. More of a hack than I would like.
};

// Creating the movie objects
var Movie = function(movieObject, index){
  this.html = "";
  this.stats = {
    title: movieObject.Title,
    year: movieObject.Year,
    imdbID: movieObject.imdbID,
    rated: movieObject.Rated,
    actors: movieObject.Actors,
    released: movieObject.Released,
    runtime: movieObject.Runtime,
    writer: movieObject.Writer,
    imdbRating: movieObject.imdbRating,
    poster: movieObject.Poster
  };
  this.html = this.getHTML(index);
};

// returns HTML
Movie.prototype.getHTML = function (index){
  if (index >= 0){ // there will be a positive integer index if this is a search page
    return "<h2 class='movie' id=" + index + " style='cursor: pointer';>" + this.stats.title + "</h2><h3>" + this.stats.year + "</h3><br><button class='btn' id='" + index + "'>favorite</button>";
  }
  else { // but not if this is a details page
    return "<h1>" + this.stats.title + "</h1><ul><li>Rated: " + this.stats.rated + "</li><li>Actors: " + this.stats.actors + "</li><li>Released: " + this.stats.released + "</li><li>Runtime: " + this.stats.runtime + "</li><li>Writer: " + this.stats.writer + "</li><li>IMDB Rating: " + this.stats.imdbRating + "</li></ul><img src=" + this.stats.poster + " alt='Movie Poster' style='width:304px;'>";
  }
};
// FAVORITING

App.prototype.addEventListenerToFavoriteButtons = function(){
  var self = this;
  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'button'){
      self.favorite(event.target.id);
    }
  });
};

// send POST request to our API with the imdbID of the favorited movie
App.prototype.favorite = function(movieID){
  var url = "http://localhost:4567/favorite";
  var data = JSON.stringify({ name: this.myMovies[movieID].stats.title, oid: this.myMovies[movieID].stats.imdbID});
  this.XMLHelper('POST', url, 'favoriteSuccess', data);
};

App.prototype.favoriteSuccess = function(responseText){

  console.log('Success! ' + responseText);
};