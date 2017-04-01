//Yelp Requirements
var yelpApi = require('../../yelp_api');
var oauthSignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var Yelp = require('yelp');
var contactsdb = require('../../database-mongo/models/contacts.js')
var Promise = require('bluebird');

var yelp = new Yelp({
  consumer_key: process.env.YELP_consumerKey,
  consumer_secret: process.env.YELP_consumerSecret,
  token: process.env.YELP_token,
  token_secret: process.env.YELP_tokenSecret
});

yelp.queryApi = function(obj) {
  return new Promise((resolve, reject) => {
    yelp.search(obj)
    .then(function (data) {
      var contacts = data.businesses;
      contacts.forEach((contact) => {
        if (contact.location.address.length === 0) {
          contact.location.address = 'Serving ' + contact.location.city;
        }
        contactsdb.Contacts.create({
          businessName: contact.name,
          businessPhone: contact.phone,
          businessAddress: contact.location.address,
          businessCity: contact.location.city,
          businessPictureUrl: contact.image_url,
          businessType: obj.term,
          businessRatingUrl: contact.rating_img_url
       }).then(function(result) {
          // console.log('stored following entry into Business Schema: ', result);     
        });       
      });
      resolve(data);
    })
    .catch(function (err) {
      console.log('im erroring out');
      console.error(err);
    });
  });
};

module.exports = yelp;