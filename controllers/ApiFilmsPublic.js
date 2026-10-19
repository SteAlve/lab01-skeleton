'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const constants = require('../utils/constants.js');
const filmsService = require('../service/FilmsService.js');

/**
 * Retrieve the public films
 * The public films (i.e., the films visible to all the users) are retrieved.
 * A pagination mechanism is used to limit the size of messages.
 * This operation does not require authentication.
 **/
module.exports.getPublicFilms = async function getPublicFilms(req, res, next) {
  let pageNo = 1;
  if (req.query.pageNo !== undefined) {
    pageNo = Number(req.query.pageNo);
    if (!Number.isInteger(pageNo) || pageNo < 1)
      return writer.writeJson(res, { error: 'pageNo must be an integer greater than or equal to 1' }, 400);
  }

  try {
    const size = parseInt(constants.ELEMENTS_IN_PAGE);
    const totalItems = await filmsService.getPublicFilmsTotal();
    const films = await filmsService.getPublicFilms(pageNo);
    const totalPages = Math.ceil(totalItems / size);

    const page = {
      totalPages: totalPages,
      currentPage: pageNo,
      totalItems: totalItems,
      films: links.addToFilm(films),
      self: `/api/films/public?pageNo=${pageNo}`
    };
    if (pageNo < totalPages)
      page.next = `/api/films/public?pageNo=${pageNo + 1}`;
    if (pageNo > 1 && totalPages >= 1)
      page.prev = `/api/films/public?pageNo=${Math.min(pageNo - 1, totalPages)}`;

    writer.writeJson(res, page, 200);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
