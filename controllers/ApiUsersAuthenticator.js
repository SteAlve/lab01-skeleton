'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const validators = require('./validators.js');
const usersService = require('../service/UsersService.js');

/**
 * Log a user in
 * The user sends email and password: if they are correct, an authenticated session is created.
 * This operation does not require authentication.
 **/
module.exports.authenticateUser = async function authenticateUser(req, res, next) {
  // The User schema requires an id, which a login request does not contain: a placeholder is added only for the validation
  if (!req.body || typeof req.body.password !== 'string' || !validators.validateUser({ ...req.body, id: 1 }))
    return writer.writeJson(res, { error: 'The body must contain a valid email and a password' }, 400);

  try {
    const user = await usersService.authenticateUser(req, res, next);
    writer.writeJson(res, links.addToUser(user), 200);
  } catch (err) {
    if (err === 'NO_USER')
      writer.writeJson(res, { error: 'Wrong email or password' }, 401);
    else
      writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};

/**
 * Log the current user out
 * The session of the current user is invalidated.
 **/
module.exports.logoutUser = async function logoutUser(req, res, next) {
  try {
    await usersService.logoutUser(res, req);
    writer.writeJson(res, null, 204);
  } catch (err) {
    if (err === 'NO_USER')
      writer.writeJson(res, { error: 'The user does not exist' }, 401);
    else
      writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
