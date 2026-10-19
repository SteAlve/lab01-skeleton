'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const usersService = require('../service/UsersService.js');

/**
 * Retrieve a user
 * The available information (password excluded) about the user with ID userId is retrieved.
 * This operation requires authentication.
 **/
module.exports.getUserById = async function getUserById(req, res, next) {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1)
    return writer.writeJson(res, { error: 'userId must be a positive integer' }, 400);

  try {
    const user = await usersService.getUserById(userId);
    if (user === undefined)
      return writer.writeJson(res, { error: 'The user does not exist' }, 404);

    writer.writeJson(res, links.addToUser(user), 200);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
