// import libraries
var express = require('express'); 
var compression = require('compression'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
var session = require('express-session');
var favicon = require('serve-favicon');
var path = require('path');
var mongoose = require('mongoose');

// initialize app
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//var secrets = require('./secrets.js');

// app setup
app.use('/assets', express.static(path.resolve(__dirname) + '../../client/assets'));
app.get('/', function(req, res){
  //the html string being sent
  var filepath = path.resolve(__dirname + '../../client/index.html');
  res.sendFile(filepath);
});
//app.use(session({process.env.MY_SECRET || secret: secrets["MY_SECRET"]}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser());

// variables
var users = {};
var rooms = [];
rooms.push("general");

// Chat
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// listen for a connection
io.on('connection', function(socket){
  //console.log('a user connected');
  socket.on("join", function(data) {

  	console.log(data.name + ' joins general');
  	
  	socket.name = data.name;
	users[socket.name] = socket.name;
	//console.log(socket.name);
  		for(var i = 0; i < rooms.length; i++){
  			socket.emit('room', rooms[i]);
  		};


  		var userKeys = Object.keys(users);
  		for(var i = 0; i < userKeys.length; i++){
  			if(socket.name != userKeys[i]){
  				socket.emit('newUser', {name: userKeys[i]});
  				//console.log(userKeys[i]);
  			}
  		};

  		console.log(users);
		
		socket.join('general');
		
		socket.broadcast.to('general').emit('joinMsg', { name: 'server', msg: data.name + " has joined the room."} );
		
		socket.emit('joinMsg', {name: 'server', msg: 'You joined general'});
	});
  // notify server of disconnect
  // still kind of broken, doesn't update properly to other clients
  socket.on('disconnect', function(msg){
  	delete users[socket.name];
  	var userKeys = Object.keys(users);
	for(var i = 0; i < userKeys.length; i++){
		socket.emit('newUser', {name: userKeys[i]});
		//console.log(userKeys[i]);
	};
  });
  // need to store list of rooms
  socket.on('joinRoom', function(msg){
  	socket.leave(msg.currentRoom);
  	socket.join(msg.newRoom);
  	io.sockets.in(msg.newRoom).emit(msg.user + " has joined " + msg.newRoom);
  });
  // notify server of a message and send message to all
  socket.on('message', function(msg){
  	//console.log(msg.user);
    io.sockets.in(msg.room).emit('message', {message: msg.message, user: msg.user});
  });
  socket.on('room', function(msg){
  	if(containsObject(msg, rooms) === false){
  		io.emit('room', msg);
  		rooms.push(msg);
  	}
  	else {
  		socket.emit('message', {message: "Room already exists!", user: "server"});
  	}
  });
  // need to store list of users
  socket.on('newUser', function(msg){
  	io.sockets.in(msg.room).emit('newUser', {name: msg.user});
  	//console.log("new user: " + msg.user);
  });
  socket.on('FacebookUser', function(msg){
  	io.sockets.in(msg.room).emit('FacebookUser', {name: msg.name, link: msg.link});
  });
});

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

http.listen(port, function(){
  console.log('listening');
});