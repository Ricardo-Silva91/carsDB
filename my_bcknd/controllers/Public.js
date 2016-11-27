'use strict';

var url = require('url');


var Public = require('./PublicService');


module.exports.allCarsGET = function allCarsGET (req, res, next) {
  Public.allCarsGET(req.swagger.params, res, next);
};

module.exports.getCarPicGET = function getCarPicGET (req, res, next) {
  Public.getCarPicGET(req.swagger.params, res, next);
};

module.exports.oneCarGET = function oneCarGET (req, res, next) {
  Public.oneCarGET(req.swagger.params, res, next);
};

module.exports.rootGET = function rootGET (req, res, next) {
  Public.rootGET(req.swagger.params, res, next);
};
