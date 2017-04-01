var express = require('express');
var db = require('../database-mongo/index.js');
var User = require('../database-mongo/models/user.js');
// var configAuth = require('./auth.js');

const passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;


// Use facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FB_appID,
    clientSecret: process.env.FB_secret,
    callbackURL: process.env.SITE_URL + 'auth/facebook/callback/'
  },
   function(accessToken, refreshToken, profile, done) {
      // console.log('profile: ', profile);
      // console.log('accessToken', accessToken);
      // console.log('refreshToken', refreshToken);
       //check user table for anyone with a facebook ID of profile.id
       User.findOne({
           'facebook.id': profile.id
       }, function(err, user) {
           if (err) {
               return done(err);
           }
           //No user was found... so create a new user with values from Facebook (all the profile. stuff)
           if (!user) {
               user = new User({
                   name: profile.displayName,
                   // email: profile.emails[0].value,
                   // username: profile.username,
                   //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                   facebook: profile._json
               });
               user.save(function(err) {
                   if (err) console.log(err);
                   return done(err, user);
               });
           } else {
            // console.log('hello user', user);
               //found user. Return
               return done(err, user);
           }
       });
   }
));

passport.serializeUser(function(user, done) {
  // console.log('serialize user: ', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // console.log('deserialize id: ', id);
  User.findById(id, function(err, user) {
    // console.log('deserialize user: ', user);
    done(err, user);
  });
});