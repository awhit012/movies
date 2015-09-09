window.onload = function(){
  var myApp = new App;
  myApp.addEventListenerToSubmitButton();
  myApp.addEventListenerToMovieTitles();
  myApp.addEventListenerToFavoriteButtons();
  myApp.getTest();
};

var App = function(){
  this.searchResults = null;
  this.myMovies = [];
  this.currentMovie;
  this.mainDiv = document.getElementById('main');
  this.spinner = new Spinner()
};



// XML HELPERS

App.prototype.XMLHelper = function(method, url, successFunction, contentType, data){
  this.spinner.spin()
  this.mainDiv.appendChild(this.spinner.el)
  var xhr = new XMLHttpRequest();
  xhr.open(method, encodeURI(url), true);
  self = this
  if (contentType) {
    xhr.setRequestHeader("Content-Type", contentType)
  }
   xhr.onload = function(){
    self.xhrOnload(xhr, successFunction);
  }
  if (data){
    xhr.send(data);
  }
  else { xhr.send() }
}

App.prototype.xhrOnload = function(xhr, successFunction){
  if (xhr.status === 200){
    this[successFunction](xhr.responseText);
    this.spinner.stop();
  }
  else { alert('Request failed.  Returned status of ' + xhr.status) }
}

// API GET REQUEST TESTER TO BE DELETED

App.prototype.getTest = function(){
  this.XMLHelper('GET', 'http://localhost:4567/favorites', 'testSuccess')
}

App.prototype.testSuccess = function(response){
  console.log(response)
}

// GETs Results of search from OMDBAPI

App.prototype.addEventListenerToSubmitButton = function(){
  var submitButton = document.getElementById("submit-button")
  submitButton.addEventListener("click", this.getResults.bind(this), event);
};

App.prototype.getResults = function(input){
  event.preventDefault()
  var input = document.getElementById("search-txt").value;
  var url = 'http://www.omdbapi.com/?s=' + input + '&y=&plot=short&r=json'
  this.XMLHelper('GET', url, 'searchSuccess')
}

App.prototype.searchSuccess = function(responseText){
  this.searchResults = JSON.parse(responseText)['Search'];
  this.createMovies();
  this.addMoviesToDOM();

}

App.prototype.createMovies = function() {
  var self = this;
  var i;
  for (i = 0; i < this.searchResults.length; i++){
    self.myMovies.push(new Movie(this.searchResults[i], i))
  }
}

App.prototype.addMoviesToDOM = function(){
  var i;
  var div = document.getElementById('main');
  div.innerHTML = ""
  for (i = 0; i < this.myMovies.length; i++){
    div.innerHTML += this.myMovies[i].html
  }
}

// MOVIE SHOW PAGES

App.prototype.addEventListenerToMovieTitles = function(){
  var self = this;
  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.className === 'movie'){
      var movie = self.myMovies[event.target.id];
      self.getMovieDetails(movie.stats['imdbID'])
    }
  });
}

App.prototype.getMovieDetails = function(imdbID){
  var url = 'http://www.omdbapi.com/?i=' + imdbID + '&plot=short&r=json'
  this.XMLHelper('GET', url, 'detailsSuccess')
}

App.prototype.detailsSuccess = function(responseText){
  this.currentMovie = new Movie(JSON.parse(responseText));
  this.renderMoviePage();
}

App.prototype.renderMoviePage = function(){
  this.mainDiv.innerHTML = this.currentMovie.html
}

var Movie = function(movieObject, index){
  this.html = "";
  var noData = "No Data"
  this.stats = {
    title: movieObject['Title'],
    year: movieObject['Year'],
    imdbID: movieObject['imdbID'],
    rated: movieObject['Rated'],
    actors: movieObject['Actors'],
    released: movieObject['Released'],
    runtime: movieObject['Runtime'],
    writer: movieObject['Writer'],
    imdbRating: movieObject['imdbRating'],
    poster: movieObject['Poster'],
  }
  this.html = this.getHTML(index);
}

Movie.prototype.getHTML = function (index){
  if (index >= 0){
    return "<h2 class='movie' id=" + index + " style='cursor: pointer';>" + this.stats['title'] + "</h2><h3>" + this.stats['year'] + "</h3><br><button class='btn' id='" + index + "'>favorite</button>"
  }
  else {
    return "<h1>" + this.stats['title'] + "</h1><ul><li>Rated: " + this.stats['rated'] + "</li><li>Actors: " + this.stats['actors'] + "</li><li>Released: " + this.stats['released'] + "</li><li>Runtime: " + this.stats['runtime'] + "</li><li>Writer: " + this.stats['writer'] + "</li><li>IMDB Rating: " + this.stats['imdbRating'] + "</li></ul><img src=" + this.stats['poster'] + " alt='Movie Poster' style='width:304px;'><br><button class='btn'>favorite</button>"
  }
}

// FAVORITING

App.prototype.addEventListenerToFavoriteButtons = function(){
  var self = this;
  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'button'){
      self.favorite(event.target.id);
    }
  });
};

App.prototype.favorite = function(movieID){
  var url = "http://localhost:4567/favorite";
  debugger
  var thisMovie = this.myMovies[movieID]
  var xhr = new XMLHttpRequest();
  xhr.open('POST', encodeURI(url), true);
  xhr.setRequestHeader("Content-Type",  "application/json")
  var self = this;
  xhr.onload = function(){
    // debugger
    self.favoriteSuccess();
  }
  xhr.send(JSON.stringify(thisMovie));
}

App.prototype.favoriteSuccess = function(responseText){

  console.log('tentative success!' + responseText);
}