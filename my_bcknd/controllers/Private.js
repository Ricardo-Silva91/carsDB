'use strict';

var url = require('url');


var Private = require('./PrivateService');


module.exports.addCarPOST = function addCarPOST (req, res, next) {
  Private.addCarPOST(req.swagger.params, res, next, req);
};

module.exports.editCarPOST = function editCarPOST (req, res, next) {
  Private.editCarPOST(req.swagger.params, res, next);
};

module.exports.loginPOST = function loginPOST (req, res, next) {
  Private.loginPOST(req.swagger.params, res, next);
};

module.exports.uploadPicPOST = function uploadPicPOST (req, res, next) {
  Private.uploadPicPOST(req.swagger.params, res, next);
};
module.exports.checkValidTokenGET = function checkValidTokenGET (req, res, next) {
    Private.checkValidTokenGET(req.swagger.params, res, next);
};