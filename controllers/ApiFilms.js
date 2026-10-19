'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const validators = require('./validators.js');
const constants = require('../utils/constants.js');
const filmsService = require('../service/FilmsService.js');

/**
 * Retrieve the films created by the logged-in user
 * All the films (both public and private) created by the logged-in user are retrieved.
 * A pagination mechanism is used to limit the size of messages.
 **/
module.exports.getOwnFilms = async function getOwnFilms(req, res, next) {
  let pageNo = 1;
  if (req.query.pageNo !== undefined) {
    pageNo = Number(req.query.pageNo);
    if (!Number.isInteger(pageNo) || pageNo < 1)
      return writer.writeJson(res, { error: 'pageNo must be an integer greater than or equal to 1' }, 400);
  }

  try {
    const size = parseInt(constants.ELEMENTS_IN_PAGE);
    const totalItems = await filmsService.getOwnFilmsTotal(req.user.id);
    const films = await filmsService.getOwnFilms(req.user.id, pageNo);
    const totalPages = Math.ceil(totalItems / size);

    const page = {
      totalPages: totalPages,
      currentPage: pageNo,
      totalItems: totalItems,
      films: links.addToFilm(films),
      self: `/api/films?pageNo=${pageNo}`
    };
    if (pageNo < totalPages)
      page.next = `/api/films?pageNo=${pageNo + 1}`;
    if (pageNo > 1 && totalPages >= 1)
      page.prev = `/api/films?pageNo=${Math.min(pageNo - 1, totalPages)}`;

    writer.writeJson(res, page, 200);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};

/**
 * Create a new film
 * A new film is created by the authenticated user, who becomes the owner.
 * The id is assigned by the service.
 **/
module.exports.createFilm = async function createFilm(req, res, next) {
  // The Film schema requires id and owner, which are assigned by the service:
  // they are added only for the validation
  if (!validators.validateFilm({ ...req.body, id: 1, owner: req.user.id }))
    return writer.writeJson(res, { error: 'The body is not a valid film', errors: validators.validateFilm.errors }, 400);

  try {
    const created = await filmsService.createFilm(req.body, req.user.id);
    const film = links.addToFilm(created);
    res.setHeader('Location', film.self);
    writer.writeJson(res, film, 201);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
