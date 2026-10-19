'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const filmsService = require('../service/FilmsService.js');

const ERRORS = {
  NO_FILMS: [404, 'The film does not exist'],
  NO_PRIVATE_FILM: [404, 'The film does not exist'],
  USER_NOT_OWNER: [403, 'The film is private and the user is not its owner']
};

/**
 * Retrieve a film
 * The film with ID filmId is retrieved if it is public or if the logged-in user is its owner.
 **/
module.exports.getSingleFilm = async function getSingleFilm(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  try {
    let film;
    try {
      film = await filmsService.getSinglePublicFilm(filmId);
    } catch (err) {
      if (err !== 'NO_PUBLIC_FILM')
        throw err;
      // The film exists but it is private: it can be retrieved only by its owner
      film = await filmsService.getSinglePrivateFilm(filmId, req.user.id);
    }
    writer.writeJson(res, links.addToFilm(film), 200);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};
