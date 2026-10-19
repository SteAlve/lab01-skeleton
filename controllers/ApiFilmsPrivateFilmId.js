'use strict';

const writer = require('../utils/writer.js');
const validators = require('./validators.js');
const filmsService = require('../service/FilmsService.js');

const ERRORS = {
  NO_FILMS: [404, 'The film does not exist'],
  NO_PRIVATE_FILM: [404, 'The film is not private'],
  USER_NOT_OWNER: [403, 'Only the owner of the film can perform this operation']
};

/**
 * Update a private film
 * The private film with ID filmId is updated. This operation does not allow changing its visibility
 * and can be performed only by the owner.
 **/
module.exports.updateSinglePrivateFilm = async function updateSinglePrivateFilm(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  // The id in the body, if present, must be the one of the path
  if (req.body && req.body.id !== undefined && req.body.id !== filmId)
    return writer.writeJson(res, { error: 'The id in the body is different from the one in the path' }, 400);

  // The Film schema requires id and owner, which are not changed by this operation:
  // they are added only for the validation
  if (!validators.validateFilm({ ...req.body, id: filmId, owner: req.user.id }))
    return writer.writeJson(res, { error: 'The body is not a valid film', errors: validators.validateFilm.errors }, 400);

  if (req.body.private !== true)
    return writer.writeJson(res, { error: 'The visibility of a film cannot be changed' }, 409);

  try {
    await filmsService.updateSinglePrivateFilm(req.body, filmId, req.user.id);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Delete a private film
 * The private film with ID filmId is deleted. This operation can be performed only by the owner.
 **/
module.exports.deleteSinglePrivateFilm = async function deleteSinglePrivateFilm(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  try {
    await filmsService.deleteSinglePrivateFilm(filmId, req.user.id);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};
