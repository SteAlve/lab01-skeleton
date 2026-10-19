'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');

/**
 * Retrieve the Film Manager
 * The Film Manager resource, representing the entry point of the REST interface, is retrieved.
 * This operation does not require authentication.
 **/
module.exports.getFilmManager = function getFilmManager(req, res, next) {
  writer.writeJson(res, links.getFilmManager(), 200);
};
