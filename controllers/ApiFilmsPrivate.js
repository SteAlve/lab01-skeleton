'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const constants = require('../utils/constants.js');
const filmsService = require('../service/FilmsService.js');

/**
 * Retrieve the private films of the logged-in user
 * The private films owned by the logged-in user are retrieved.
 * A pagination mechanism is used to limit the size of messages.
 **/
module.exports.getPrivateFilms = async function getPrivateFilms(req, res, next) {
  let pageNo = 1;
  if (req.query.pageNo !== undefined) {
    pageNo = Number(req.query.pageNo);
    if (!Number.isInteger(pageNo) || pageNo < 1)
      return writer.writeJson(res, { error: 'pageNo must be an integer greater than or equal to 1' }, 400);
  }

  try {
    const size = parseInt(constants.ELEMENTS_IN_PAGE);
    const totalItems = await filmsService.getPrivateFilmsTotal(req.user.id);
    const films = await filmsService.getPrivateFilms(req.user.id, pageNo);
    const totalPages = Math.ceil(totalItems / size);

    const page = {
      totalPages: totalPages,
      currentPage: pageNo,
      totalItems: totalItems,
      films: links.addToFilm(films),
      self: `/api/films/private?pageNo=${pageNo}`
    };
    if (pageNo < totalPages)
      page.next = `/api/films/private?pageNo=${pageNo + 1}`;
    if (pageNo > 1 && totalPages >= 1)
      page.prev = `/api/films/private?pageNo=${Math.min(pageNo - 1, totalPages)}`;

    writer.writeJson(res, page, 200);
  } catch (err) {
    writer.writeJson(res, { error: 'Internal server error' }, 500);
  }
};
