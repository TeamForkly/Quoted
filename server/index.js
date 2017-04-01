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
var multer = require('multer');
var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    // Mimetype stores the file type, set extensions according to filetype
    switch (file.mimetype) {
    case 'image/jpeg':
      ext = '.jpeg';
      break;
    case 'image/png':
      ext = '.png';
      break;
    case 'image/gif':
      ext = '.gif';
      break;
    case 'text/csv':
      ext = '.csv';
      break;
    }

    cb(null, file.originalname.slice(0, 4) + Date.now() + ext);
  }
});
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

// SMS
app.post('/messages', handler.textBusinesses);
app.post('/', handler.receiveText); // SHOULD CHANGE ngrok path to '/sms' if there is time.
// app.post('/sms', handler.receiveText); 
app.get('/findText/:number', handler.findResponsesFromContactNumber);

app.post('/call', handler.callBusinesses)  
app.post('/voice', handler.setVoiceMessage);
let port = process.env.PORT || 3000;
//Deployment ports
app.set('port', (port));

app.listen(port, function() {
  console.log('listening on on port:' + port);
});


