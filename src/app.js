// import libraries
var express = require('express'); 
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// initialize app
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/assets', express.static(path.resolve(__dirname) + '../../client/assets'));
app.get('/', function(req, res){
  //the html string being sent
  var filepath = path.resolve(__dirname + '../../client/index.html');
  res.sendFile(filepath);
});

var port = process.env.PORT || process.env.NODE_PORT || 3000;

// listen for a connection
io.on('connection', function(socket){
  console.log('a user connected');
  // notify server of disconnect
  socket.on('disconnect', function(){
  	console.log('a user disconnected');
  });
  // notify server of a message and send message to all
  socket.on('message', function(msg){
    io.emit('message', msg);
  });
});

http.listen(port, function(){
  console.log('listening');
});