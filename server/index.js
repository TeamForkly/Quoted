require('../config/config.js');
// var setup = require('./auth.js');
var express = require('express');
var bodyParser = require('body-parser');
var db = require('../database-mongo/index.js');
var User = require('../database-mongo/models/user.js');
var handler = require('./request-handler');
// var cookieParser = require('cookie-parser');
// var session = require('express-session');
var facebook = require('./facebook.js');
var passport = require('passport');
var s3Router = require('./s3Router');
var loadExampleData = require('./loadExampleData').loadExampleData;
var threadsExampleData = require('./threadsExampleData').threadsExampleData;
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var http = require('http');
var app = express();

loadExampleData();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/../react-client/dist'));
app.use(express.session({secret: 'Greenfie1dBr0s'}));
app.use(express.cookieParser());

app.use(passport.initialize());
app.use(passport.session());


// facebook passport
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));

app.post('/user/addcontacts', upload.single('file'), handler.userAddcontacts);
app.post('/businesses', handler.checkBusinessData);

// put contacts in db
app.post('/db/contacts', handler.addContactsToDB);

// get groupnames from db
app.get('/groupNames', handler.getGroupNames);

// SMS
app.post('/messages', handler.textBusinesses);
app.post('/sms', handler.receiveText);
// app.post('/createNewThread/group/:groupName', handler.createNewThread);

app.get('/findText/:number', handler.findResponsesFromContactNumber);

app.post('/call', handler.callBusinesses)  
app.post('/voice', handler.setVoiceMessage);

// get request handler for threads
app.get('/threads', handler.fetchThreads);
// app.get('/threads', (req, res) => {
//   res.send(threadsExampleData);
// });


let port = process.env.PORT || 3000;

// save to db
app.post('/createNewGroup/group/:groupName', handler.createNewGroup);

//Deployment ports
// app.set('port', (port));

app.listen(port, function() {
  console.log('listening on on port:' + port);
});


