'use strict';

const writer = require('../utils/writer.js');

/**
 * Assign the public films to the users for review
 * The design of this operation is mandatory, its implementation is not required.
 **/
module.exports.assignReviewers = function assignReviewers(req, res, next) {
  writer.writeJson(res, { error: 'This operation is not implemented' }, 501);
};
