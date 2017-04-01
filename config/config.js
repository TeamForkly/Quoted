'use strict';

var dotenv = require('dotenv');
dotenv.load();
dotenv.config({path: process.env.PWD + '/config.env'});
console.log(process.env.PWD + '/config.env');