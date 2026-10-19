'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const usersService = require('../service/UsersService.js');

/**
 * Retrieve the users
 * The available information (passwords excluded) about all the users is retrieved.
 * This operation is available only to authenticated users.
 **/
module.exports.getUsers = async function getUsers(req, res, next) {
  try {
    const users = await usersService.getUsers();
    writer.writeJson(res, links.addToUser(users || []), 200);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
