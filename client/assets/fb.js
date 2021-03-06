'use strict';
var username;
var currentRoom = "general";

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  //console.log('statusChangeCallback');
  //console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    testAPI();
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
    document.getElementById('statusWindow').style.visibility = 'visible';
  } else {

  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '358885457635387',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    //console.log('Successful login for: ' + response.name);
    //console.log(response);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
    document.getElementById('statusWindow').style.visibility = 'visible';

    username = response.name;

    socket.emit('FacebookUser', {name: response.name, link: response.link, room: currentRoom});
  });
}

var socket = io();
// sending messages
$('#msgForm').submit(function(){
  // send message to server
  socket.emit('message', {user: username, message: $('#m').val(), room: currentRoom});
  $('#m').val('');
  return false;
});
socket.on('message', function(msg){
  // add message to the chat
  var div = $('<div>').attr("class","message");
  div.text(msg.user + ": " + msg.message);
  $('#messageWindow').append(div);

  // pin chat to bottom
  var objDiv = document.getElementById("messageWindow");
  objDiv.scrollTop = objDiv.scrollHeight;
});

// receive messages from server
socket.on('joinMsg', function(msg){
  var div = $('<div>').attr("class","message");
  div.text(msg.name + ": " + msg.msg);
  $('#messageWindow').append(div);

  // pin chat to bottom
  var objDiv = document.getElementById("messageWindow");
  objDiv.scrollTop = objDiv.scrollHeight;
});

// creating new rooms
$('#roomForm').submit(function(){
  // send message to server
  socket.emit('room', $('#roomInput').val());
  $('#roomInput').val('');
  return false;
});
socket.on('room', function(msg){
  // add message to the chat
  var room = $('<a>').attr("class","room");
  room.text(msg);
  room.attr("href", "#" + msg);
  $('#chatrooms').append(room);

  newRoom();
});

function newRoom() {
  // joining new rooms
  var rooms = document.getElementsByClassName('room');
  for(var i = 0; i < rooms.length; i++) {
    //console.log(rooms[i]);
    rooms[i].onclick = function(){
      var room = this.hash;
      console.log(room);

      socket.emit('joinRoom', {newRoom: room, user: username, currentRoom: currentRoom});
    };
  };
};

// add new users
socket.on('newUser', function(msg){
  var newUser = $('<div>').attr("class","user");
  newUser.text(msg.name);
  $('#userList').append(newUser);
});

socket.on('FacebookUser', function(msg){
  var newUser = $('<a>').attr("class","user");
  newUser.attr("href", msg.link);
  newUser.attr("target", "_blank");
  newUser.text(msg.name);
  $('#userList').append(newUser);
});

// wait for html to load
$(document).ready(function(){
    username = "mentee" + Math.floor(Math.random() * (10001));
    //console.log(username);

    socket.emit('join', {name: username});
    socket.emit('newUser', {user: username, room: currentRoom});
    
    newRoom();
}); 