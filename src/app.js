// import libraries
var express = require('express'); 
var compression = require('compression'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
var session = require('express-session');
var favicon = require('serve-favicon');
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// initialize app
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var secrets = require('./secrets.js');
//console.log(secrets["FB_SECRET"]);

// app setup
app.use('/assets', express.static(path.resolve(__dirname) + '../../client/assets'));
app.get('/', function(req, res){
  //the html string being sent
  var filepath = path.resolve(__dirname + '../../client/index.html');
  res.sendFile(filepath);
});
app.use(session({secret: secrets["MY_SECRET"]}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser());

// Facebook Login
passport.use(new FacebookStrategy({
    clientID: process.env.API_KEY_FACEBOOK_ID || secrets["FB_APP_ID"],
    clientSecret: process.env.API_KEY_FACEBOOK_SECRET || secrets["FB_SECRET"],
    callbackURL: 'https://127.0.0.1:'+port+'/facebook-token'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

app.get('/facebook-login', passport.authenticate('facebook'));
 
app.get('/facebook-token', passport.authenticate('facebook', { failureRedirect: '/error' }),
  function(req, res){
    res.send('Logged In.');
  });

// Chat
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