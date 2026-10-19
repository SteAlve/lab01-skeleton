'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const validators = require('./validators.js');
const filmsService = require('../service/FilmsService.js');

const ERRORS = {
  NO_FILMS: [404, 'The film does not exist'],
  NO_PUBLIC_FILM: [404, 'The film is not public'],
  USER_NOT_OWNER: [403, 'Only the owner of the film can perform this operation']
};

/**
 * Retrieve a public film
 * The public film with ID filmId is retrieved. This operation does not require authentication.
 **/
module.exports.getSinglePublicFilm = async function getSinglePublicFilm(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  try {
    const film = await filmsService.getSinglePublicFilm(filmId);
    writer.writeJson(res, links.addToFilm(film), 200);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Update a public film
 * The public film with ID filmId is updated. This operation does not allow changing its visibility
 * and can be performed only by the owner.
 **/
module.exports.updateSinglePublicFilm = async function updateSinglePublicFilm(req, res, next) {
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

  if (req.body.private !== false)
    return writer.writeJson(res, { error: 'The visibility of a film cannot be changed' }, 409);

  try {
    await filmsService.updateSinglePublicFilm(req.body, filmId, req.user.id);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Delete a public film
 * The public film with ID filmId is deleted. This operation can be performed only by the owner.
 **/
module.exports.deleteSinglePublicFilm = async function deleteSinglePublicFilm(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  try {
    await filmsService.deleteSinglePublicFilm(filmId, req.user.id);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};
