var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

//database
var db = require('../database-mongo/index.js');
var contactsdb = require('../database-mongo/models/contacts.js');
var Users = require('../database-mongo/models/user.js');
var responsesdb = require('../database-mongo/models/responses.js');
var threadsdb = require('../database-mongo/models/threads.js');


//Yelp
var yelp = require('./yelp/yelp-query.js');

//Twillio Requirements
var twilio = require('twilio');
// var twilioKeys = require('../twilio_api');
var twiml = new twilio.TwimlResponse();
var accountSid = process.env.TWILIO_ACCOUNT_SID; 
var authToken = process.env.TWILIO_AUTH_TOKEN;
var phoneNumber = process.env.TWILIO_NUMBER;

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

//require formatter for adding contacts via file upload
var phoneNumberFormatter = require('phone');

exports.checkBusinessData = function(req, res) {
  console.log('REQ USER IS', req.user);
  var category = req.body.category;
  var location = req.body.location;

  //currently not being used
  // var term = req.body.term;
  // var geolocationLat = req.body.geolocationLat;
  // var geolocationLong = req.body.geolocationLong;  

  contactsdb.Contacts.find({"businessType": category})
    .exec(function(err, result) {
      if (err) {
          res.status(500).send("Something unexpected and horrendeous happened");  
      } else {
        // if(result.length <= 2) {
        //   yelp.queryApi({ 'term': category, 'location': location })
        //   .then((results) => {
        //     // console.log('results.businesses', results.businesses);
        //     res.json(results.businesses);
        //   });
        // } else {            
        //   // console.log('yelp query results: ', result);
        // }
        res.json(result); 
      }
    });
};

let createNewThread = function(body, callback) {
  console.log('Creating new thread');
  Threads.create({
    outboundMsg: body.textInput,
    groupName: body.groupName,
    contacts: body.businesses
  }, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      console.log('data', data);
      callback(null, data);
    }
  });
}

exports.textBusinesses = function(req, res) {
  // console.log('getting response from client'); 
  // console.log('req body', req.body);
  var textInput = req.body.textInput
  
  // console.log('textInput', textInput);
  // console.log('req.user: ', req.user);
  // console.log('req.body: ', req.body);
  
  // if we are just getting an array from the client then we don't need to do the Business.find
  // we'd just start on the forEach loop
  // var businessType = "test" // req.body.businesstype
  // var location = "San Francisco" // req.body.    locationCity? 
  
  //change this so that we're sending text to req.body.businesses
  var businessType = req.body.groupName;
  var location = req.body.location;

  // create new thread
  if (req.user) {
    return threadsdb.Threads.create({
      outboundMsg: req.body.textInput,
      groupName: req.body.groupName,
      contacts: req.body.businesses
    })
    .then((thread) => {
      // console.log(thread);
      return Users.findByIdAndUpdate(req.user._id, {$push: {threads: thread.id}});
    })
    .then(() => {
      // res.end();    
      contactsdb.Contacts.find({businessType: businessType}, function(err, businesses){
        if (err) {
          console.log(err);
        } else {
          // console.log('test businesses', businesses);
          businesses.forEach(function(biz) {
            client.messages.create({
              to: biz.contactPhoneNumber,
              from: phoneNumber,
              body: 'Hey ' + biz.contactName +  '! ' + textInput
            }, function (err, message) {
              if (err) {
                console.log('err', err);
                res.status(404).end();
              } else {
                console.log('sent message!!!!!');
                // console.log('message sid', message.sid);
                res.status(200).send();
              }
            });
          });
        }
      }); // possibly limit here if we're still quering from db!
    })

  } else {
    res.end();
  }

};

/* NGROK
documentation: https://www.twilio.com/docs/quickstart/node/programmable-sms#receive-inbound-sms-messages

overall: You need to run ngrok and expose your port to the public
1. download ngrok and place the exe in: /usr/local/bin
2. in terminal, run: ngrok http 3000
3. take the forwarding url and add to your twilio message webhook. NOTE: THIS CHANGES EVERYTIME YOU RESTART NGROK
4. to inspect ngrok, view your ngrok console and/or http://localhost:4040

*/

// webhook for SMS response
exports.receiveText = function(req, res) {
  // console.log('RECEIVED TEXT', req.body);
  var inboundMsg = req.body.Body;
  var fromNumber = req.body.From;
  // to take out the leading '+1' for US. for example, +14085603553 will now be saved as 4085603553
  fromNumber = Number(req.body.From.slice(2)); 

  // var twilio = require('twilio');
  let response = {
    fromNumber: fromNumber,
    inboundMsg: inboundMsg
  };

  if (req.user) {
    return Users.findById(req.user._id)
    .then((user) => {
      return user.threads[threads.length - 1];
    })
    .then((threadId) => {
      // return Users.findByIdAndUpdate(req.user._id, {$push: {threads: thread.id}});
      return threadsdb.Threads.findByIdAndUpdate(threadId, {$push: {responses: response}});
    })
    .then(() => {
      res.end();
      // if (err) {
      //   res.status(500).send(err);
      //   return;
      // } else {
      //   twiml.message('From Forkly: Thanks for your text!');
      //   res.writeHead(200, {'Content-Type': 'text/xml'});
      //   res.end(twiml.toString());
      // }
    });

  // if (req.user) {
  //   return responsesdb.Responses.create({
  //     fromNumber: fromNumber,
  //     inboundMsg: inboundMsg
  //   })
  //   .then((response) => {
  //     response = response;
  //     return Users.findById(req.user._id);
  //   })
  //   .then((user) => {
  //     return user.threads[threads.length - 1];
  //   })
  //   .then((threadId) => {
  //     // return Users.findByIdAndUpdate(req.user._id, {$push: {threads: thread.id}});
  //     return threadsdb.Threads.findByIdAndUpdate(threadId, {$push: {responses: response}});
  //   })
  //   .then(() => {
  //     res.end();      
  //   });


  } else {
    res.end();
  }

  // responsesdb.createResponse(fromNumber, inboundMsg, function(err, data) {
  //   // console.log('GOT THE NUMBER!', fromNumber);
  //   // console.log('GOT THE MSG!', inboundMsg);
  //   if (err) {
  //     res.status(500).send(err);
  //     return;
  //   } else {
  //     twiml.message('From Forkly: Thanks for your text!');
  //     res.writeHead(200, {'Content-Type': 'text/xml'});
  //     res.end(twiml.toString());
  //   }
  // });
};

// finding texts in db from specific user 
exports.findResponsesFromContactNumber = function(req, res) {
  let fromNumber = req.params.number;

  responsesdb.findResponsesFromContactNumber(fromNumber, function(err, data) {
    if (err) {
      res.status(500).send(err);
      return;
    } else {
      res.send(data);
    }
  });
};

// exports.createNewThread = function(req, res) {
//   let groupName = req.params.groupName;
//   // let outboundMsg = req.params.outboundMsg;
//   let query = req.query;
//   // console.log(outboundMsg);
//   console.log(query);
  
//   threadsdb.createNewThread(groupName, function(err, data) {
//     if (err) {
//       res.status(500).send(err);
//       return;
//     } else {
//       res.send(groupName);
//     }
//   });
// };

exports.callBusinesses = function(req, res) {

  var businessType = req.body.groupName;
  var location = req.body.location;
  // console.log('request body', req.body);
  // console.log('businessType', businessType);
  // console.log('location', location);


  contactsdb.Contacts.find({businessType: businessType, businessCity: location}, function(err, businesses){
    if (err) {
      console.log(err);
    } else {
      // console.log('test businesses', contacts);
      contacts.forEach(function(contact) {
        client.calls.create({
          // FOR THE URL in the server in terminal write "./ngrok http 3000". Then paste the URL below followed by /voice
          url: 'https://0ab38556.ngrok.io/voice', // CHANGE THIS!!!!
          // url: 'http://demo.twilio.com/docs/voice.xml', // The twilio test
          to: contact.businessPhone,
          from: '4152001619',
        }, function (err, call) {
          if (err) {
            console.log(err);
          } else {
            process.stdout.write(call.sid);
            res.status(200).send();
          }
        });
      });
    }
  });
};

exports.setVoiceMessage = function(req, res) {
  // console.log('in set vm', req.body);
  // var voiceRecording = 'https://s3-us-west-1.amazonaws.com/hrsf72-quoted-app/65005.mp3'; // req.body to get

  // var voiceRecording = 'http://www.music.helsinki.fi/tmt/opetus/uusmedia/esim/a2002011001-e02.wav'; // WAV classical music in case we get too many errors
  // var voiceRecording = 'http://www.stephaniequinn.com/Music/Jazz%20Rag%20Ensemble%20-%2010.mp3'; // MP3 JAZZ
  // var voiceRecording = 'http://demo.twilio.com/docs/classic.mp3'; 
  // var voiceRecording = 'https://s3-us-west-1.amazonaws.com/hrsf72-quoted-app/75386.mp3'
  // var voiceRecording = 'https://s3-us-west-1.amazonaws.com/hrsf72-quoted-app/90665.audio'
  var voiceRecording = 'https://s3-us-west-1.amazonaws.com/hrsf72-quoted-app/DemoAudioRecording.wav' // manually converted using internet from webm to wav
  // var user = req.body.user;
  var user = {
    name: "edwin brower",
    userCellPhone: 7703357571
  }

  var quotedMessage = 'This message was sent through Quoted. Please call back ' + user.name + ' at ' + user.userCellPhone + ' that again is ' + user.userCellPhone;
  // var quotedMessage = 'This message was sent through Quoted. Please call back the number provided within the message';
  twiml.play(voiceRecording);
  twiml.say(quotedMessage, 
    {
      'voice':'alice',
      'language':'en-GB'
    });
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
};

exports.userAddcontacts = function(req, res) {
  var contacts = req.file.buffer
  .toString('ascii')
  .trim()
  .split('\n');

  contacts = contacts.map((contact) => {
    contact = contact.split(',');
    console.log('contact after split', contact);
    console.log('formatter', phoneNumberFormatter(contact[1], contact[2] || 'US'));
    contact[1] = phoneNumberFormatter(contact[1], contact[2] || 'US')[0].slice(2);
    return contact;
  });

  console.log('at server, contacts = ', contacts);

  // contacts looks like [[name, number], [name, number]]

 // REFACTOR...
 //  for (let contact of contacts) {
 //    contactsdb.addContact(...contact);
 //  }

 //  res.send({ responseText: req.file.path });
 // WILL INSTEAD send contacts back to FileUpload component to be stored in state
   // res.send(JSON.stringify(contacts));
   res.json(contacts);

};

// Add contacts into db
exports.addContactsToDB = function(req, res) {
  // console.log('contacts req.body: ', req.body);
  let contacts = req.body.contacts.map((contact) => {
    return {
      contactName: contact[0],
      contactPhoneNumber: contact[1],
      businessType: req.body.groupName
    }
  });

  // console.log('contacts to be put into db: ', contacts)
  

  let contactsPromises = contacts.map((contact) => {
    // console.log('contact: ', contact);
    return contactsdb.Contacts.create(contact);
  });

  Promise.all(contactsPromises)
  .then(() => {
    // console.log('finished promises');
    res.end()
  });
}

exports.getGroupNames = function(req, res) {
  contactsdb.Contacts.distinct('businessType').then((groupNames) => {
    // console.log(groupNames);
    res.send(groupNames);
  });
}

exports.fetchThreads = function(req, res) {
  if (req.user) {
    Users.findById(req.user._id)
    .populate('threads')
    .then((users) => {
      // console.log('THIS threads: ', users.threads);
      res.send(users.threads);
    })
    // .exec(function(err, threads) {
    //   res.send(threads);
    // });
  } else {
    res.end();
  }
}
// exports.createNewGroup = function(req, res) {
//   let groupName = req.params.groupName.slice(1);
//   var contacts = req.body.contacts;
//   console.log('groupName', groupName);
//   // console.log('contacts', contacts);
//   contacts.forEach(contact => {
//     console.log(contact, groupName);
//     contactsdb.addContact(contact[0], contact[1], [groupName]);
//   });

//   res.json('hit server!');
// };


// COMMENTS FROM GREENFIELD BROS: 

// exports.createSalt = function() {
//   return crypto.randomBytes(20).toString('hex');
// };

// exports.userSignUp = function(req, res) {
//   var name = req.body.name;
//   var username = req.body.username;
//   var password = req.body.password;

//   Users.findOne({ "username": username })
//     .exec(function(err, user) {
//       if (!user) {
//         Users.create({'name': name, 'username': username, 'password': password});
//         res.json('Account created');
//       } else {
//       	res.json('Account already exists');
//         console.log('Account already exists');
//       }
//     });
// };

// exports.userLogin = function(req, res) {
//   var username = req.body.username;
//   var password = req.body.password;

//   Users.findOne({ "username": username })
//   	.exec(function(err, user) {
//   		console.log('user logging in: ', user);
//   		if (!user) {
//         res.status(500).send("No such user");
//       } else {
//   			Users.comparePassword(password, user.password, function(err, match) {
// 		  		if (err) {
// 		  			res.status(404).send("Incorrect Password");
// 		  		} else {
// 		  			console.log('req session prior to reg: ', req.session);
// 		  			  req.session.regenerate(function() {
//               req.session.user = user;
// 		  				console.log('req session after reg: ', req.session);		  				
//               res.json(user);
// 		  				});
//   				}
//   			});
// 			}
// 		});
// };

// exports.userLogout = function(req, res) {
// 	req.session.destroy(function() {
// 		res.redirect('/user/login');
// 	})
// };
