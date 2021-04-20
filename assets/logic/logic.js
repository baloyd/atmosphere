$(document).ready(function () {
	let searchbutton = $("#youtubesearchbutton");
	let searchinput = $("#youtubesearch");
	let userVisualChoice;
	let clientLoaded = false

	//replace this with project account key later

	// use the id from the JSON search api
	function youtubePlayer() {
		if (!clientLoaded) {loadClient()}
		else {execute()}
		console.log(userVisualChoice)
	}

	// let youtubeKey = "AIzaSyD3zSXnL-OmdY16kUbJdV5Jrik9WI50LPg"

		function loadClient() {
			debugger
			gapi.client.setApiKey("AIzaSyD3zSXnL-OmdY16kUbJdV5Jrik9WI50LPg");
			gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
			.then(function() { console.log("YOUTUBE: GAPI client loaded for API"); execute(); },
			function(err) { console.error("Error loading GAPI client for API", err); });
		}

	function execute() {
		gapi.client.youtube.search.list(
			{"q": searchinput.val()} )
			.then(function(response) {
				// Handle the results here (response.result has the parsed body).
				// debugger
				console.log("Response", response);
				let youtubeIDCode = response.result.items[0].id.videoId
				console.log(youtubeIDCode)

		let iframe = $("<iframe>");
		let youtubeContent = $("#youtubeContent");
		let youtubeURL = `https://www.youtube.com/embed/${youtubeIDCode}?controls=0&mute=1&showinfo=0&rel=0&autoplay=1&loop=1`;
		youtubeContent.empty()
		iframe.attr("src", youtubeURL);
		iframe.attr("width", "560");
		iframe.attr("height", "315");
		iframe.attr("frameborder", "0");
		iframe.appendTo(youtubeContent);
			},
				function(err) { console.error("Execute error", err); debugger });
			}
	searchbutton.on("click", youtubePlayer);
});

// POINT BEFORE THINGS BREAK AGAIN

//spotify logic

var redirect_uri = "https://vyncent-t.github.io/atmosphere-project/"; 

var client_id = "50885eb87ce14757bdde10e7fb01f91a"; 
var client_secret = "4acdaecbdc96463bbe8daee8d938550c"; // In a real app you should not expose your client_secret to the user



const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";


function onPageLoad(){
    // client_id = localStorage.getItem("client_id");
    // client_secret = localStorage.getItem("client_secret");

    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
   
        }
    
   


function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    // client_id.value;
    // client_secret.value;

    // localStorage.setItem("client_id", client_id);
    // localStorage.setItem("client_secret", client_secret); 
	
	// In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(code){
    // refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}



function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            // localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            // localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}





function callApi(method, url, body, callback){
    var xhr = new XMLHttpRequest();
    xhr.open(method,url,true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.setRequestHeader('Authorization','Bearer ' +access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function refreshPlaylists(){
    callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
}

function handlePlaylistsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("playlists");
        data.items.forEach(item => addPlaylist(item));
        // document.getElementById('playlists').value=currentPlaylist;
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addPlaylist(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node); 
}


function removeAllItems(elementId){
    var node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}