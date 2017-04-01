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
loadExampleData();

var app = express();

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

//router for S3
// app.use('/s3', s3Router({
//   bucket: 'hrsf72-quoted-app',
//   ACL: 'public-read-write'
// }))



// app.get('/user', function(req, res){ 
//   var sessionCheck = req.session ? !!req.session.username : false;
//   if (sessionCheck) {
//     res.json(req.session.user);
//   } else {
//     res.json(null);
//   }
// });

// app.post('/user', function(req, res){
//   console.log('req ', req);
//   var sessionCheck = req.session ? !!req.session.username : false;
//   if (sessionCheck) {
//     console.log('i\'m getting destroyed');
//     req.session.destroy(function(){
//       res.end();
//     }); 
//   } else {
//     console.log('failed');
//     res.end();
//   }
// });

// app.post('/login', function (req, res) {
//  var username = req.body.username;
//  var password = req.body.password;

//  User.findOne({
//    username: username,
//  }, function(err, data) {
//   User.comparePassword(password, data.password, function (firstarg, secondArgs) {
//     if(secondArgs) {
//       console.log('COREECT password')
//       // res.redirect('/?#/');
//       // res.send(200).l
//     } else {
//       console.log('wrong password')
//       // res.redirect('/?#/login')
//     }
//   })
//  });
//  // res.end()
// });


// app.post('/signup', function (req, res) {
//  var name1 = req.body.name;
//  var username = req.body.username;
//  var email = req.body.userEmail;
//  var password = req.body.password;

//  User.create({
//    name: name1,
//    username: username,
//    userEmail: email,
//    password: password
//  }, function(err, data) {
//    console.log('saved login');
//    res.status(300).send();
//  });


//  res.end()
// });

// app.post('/user/signup', handler.userSignUp);
// app.post('/user/login', handler.userLogin);
// app.get('/user/logout', handler.userLogout);

app.post('/user/addcontacts', upload.single('file'), handler.userAddcontacts);
app.post('/businesses', handler.checkBusinessData);

// SMS
app.post('/messages', handler.textBusinesses);
// app.post('/sms', handler.receiveText);
app.post('/', handler.receiveText);

app.post('/call', handler.callBusinesses)  
app.post('/voice', handler.setVoiceMessage);
let port = process.env.PORT || 3000;
//Deployment ports
app.set('port', (port));

app.listen(port, function() {
  console.log('listening on on port:' + port);
});

