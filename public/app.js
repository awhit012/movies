window.onload = function(){
  var myApp = new App;
  myApp.addEventListenerToSubmitButton();
  myApp.addEventListenerToFavoriteButtons();
  myApp.addEventListenerToMovieTitles();
  myApp.getTest();
};

var App = function(){
  this.myMovies = null;
  this.currentMovie = null;
};

App.prototype.getTest = function(){
  this.XMLHelper('GET', 'http://localhost:4567/favorites', 'testSuccess')
}

App.prototype.testSuccess = function(response){
  console.log(response)
}

App.prototype.addEventListenerToSubmitButton = function(){
  var submitButton = document.getElementById("submit-button")
  submitButton.addEventListener("click", this.getResults.bind(this), event);
};

App.prototype.XMLHelper = function(method, url, successFunction, contentType, data){
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
    debugger
    xhr.send(data);
  }
  else { xhr.send() }
}

App.prototype.xhrOnload = function(xhr, successFunction){
  if (xhr.status === 200){
    this[successFunction](xhr.responseText);
  }
  else { alert('Request failed.  Returned status of ' + xhr.status) }
}

App.prototype.getResults = function(input){
  event.preventDefault()
  var input = document.getElementById("search-txt").value;
  var url = 'http://www.omdbapi.com/?s=' + input + '&y=&plot=short&r=json'
  this.XMLHelper('GET', url, 'searchSuccess')
}

App.prototype.searchSuccess = function(responseText){
  this.myMovies = new Movies(JSON.parse(responseText));
  this.myMovies.createMovies();
  this.myMovies.addMoviesToDOM();
}

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
  var thisMovie = this.myMovies.movies[movieID]
  var xhr = new XMLHttpRequest();
  xhr.open('POST', encodeURI(url), true);
  xhr.setRequestHeader("Content-Type",  "application/json")
  var self = this;
  xhr.onload = function(){
    console.log(response)
  }
  xhr.send(thisMovie);
}

App.prototype.favoriteSuccess = function(responseText){

  console.log('tentative success!' + responseText);
}

App.prototype.addEventListenerToMovieTitles = function(){
  var self = this;
  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.className === 'movie'){
      var movie = self.myMovies.movies[event.target.id];
      self.getMovieDetails(movie.imdbID)
    }
  });
}

App.prototype.getMovieDetails = function(imdbID){
  var url = 'http://www.omdbapi.com/?i=' + imdbID + '&plot=short&r=json'
  this.XMLHelper('GET', url, 'detailsSuccess')
}

App.prototype.detailsSuccess = function(responseText){
  this.currentMovie = new Movie(JSON.parse(responseText), null);
  this.renderMoviePage(this.generateHTMLForMoviePage());
}

App.prototype.generateHTMLForMoviePage = function(){
  console.log(this.currentMovie)

}

App.prototype.renderMoviePage = function(html){
  var div = document.getElementById('main');
  div.innerHTML = html
}

var Movies = function(results){
  this.results = results['Search'],
  this.movies = []
}

Movies.prototype.createMovies = function(){
  var i;
  for (i = 0; i < this.results.length; i++){
    this.movies.push(new Movie(this.results[i], i))
  }
}

Movies.prototype.addMoviesToDOM = function(){
  var i;
  var div = document.getElementById('main');
  div.innerHTML = ""
  for (i = 0; i < this.movies.length; i++){
    div.innerHTML += this.movies[i].html
  }
}

var Movie = function(movieObject, index){
  var noData = "No Data"
  this.title = movieObject['Title'] || noData,
  this.year = movieObject['Year'] || noData,
  this.imdbID = movieObject['imdbID'] || noData
  if (index){
    this.html = "<h2 class='movie' id=" + index + " style='cursor: pointer';>" + this.title + "</h2><h3>" + this.year + "</h3><br><button class='btn' id='" + index + "'>favorite</button>"
  }
  else {
    this.html = 'yo'//"<h1>" + this.currentMovie.Title + "</h1><ul><li>Rated: " + this.currentMovie.Rated + "</li><li>Actors: " + this.Actors + "</li><li>Released: " + this.Released + "</li><li>Runtime: " + this.Runtime + "</li><li>Writer: " + this.Writer + "</li><li>IMDB Rating: " + this.imdbRating + "</li></ul><img src=" + this.currentMovie.Poster + " alt='Movie Poster' style='width:304px;'><br><button class='btn'>favorite</button>"
  }
}
