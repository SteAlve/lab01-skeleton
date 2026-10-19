'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const validators = require('./validators.js');
const constants = require('../utils/constants.js');
const filmsService = require('../service/FilmsService.js');
const reviewsService = require('../service/ReviewsService.js');

const ERRORS = {
  NO_FILMS: [404, 'The film does not exist'],
  NO_PUBLIC_FILM: [404, 'The film is not public'],
  USER_NOT_OWNER: [403, 'Only the owner of the film can perform this operation'],
  PRIVATE_FILM: [409, 'A private film cannot be assigned for review'],
  REVIEWER_ID_IS_NOT_USER: [400, 'At least one of the invited users does not exist'],
  EXISTING_REVIEW: [409, 'At least one of the users has already been invited']
};

/**
 * Retrieve the reviews of a public film
 * All the reviews issued or completed for the public film with ID filmId are retrieved.
 * A pagination mechanism is used to limit the size of messages.
 * This operation does not require authentication.
 **/
module.exports.getFilmReviews = async function getFilmReviews(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  let pageNo = 1;
  if (req.query.pageNo !== undefined) {
    pageNo = Number(req.query.pageNo);
    if (!Number.isInteger(pageNo) || pageNo < 1)
      return writer.writeJson(res, { error: 'pageNo must be an integer greater than or equal to 1' }, 400);
  }

  try {
    // 404 if the film does not exist or is not public
    await filmsService.getSinglePublicFilm(filmId);

    const size = parseInt(constants.ELEMENTS_IN_PAGE);
    const totalItems = await reviewsService.getFilmReviewsTotal(filmId);
    const reviews = await reviewsService.getFilmReviews(pageNo, filmId);
    const totalPages = Math.ceil(totalItems / size);

    const page = {
      totalPages: totalPages,
      currentPage: pageNo,
      totalItems: totalItems,
      reviews: links.addToReview(reviews),
      self: `/api/films/public/${filmId}/reviews?pageNo=${pageNo}`
    };
    if (pageNo < totalPages)
      page.next = `/api/films/public/${filmId}/reviews?pageNo=${pageNo + 1}`;
    if (pageNo > 1 && totalPages >= 1)
      page.prev = `/api/films/public/${filmId}/reviews?pageNo=${Math.min(pageNo - 1, totalPages)}`;

    writer.writeJson(res, page, 200);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Issue a film review to one or more users
 * The public film with ID filmId is assigned to one or more users for review, and the corresponding
 * reviews are created. This operation can be performed only by the owner.
 **/
module.exports.issueFilmReview = async function issueFilmReview(req, res, next) {
  const filmId = Number(req.params.filmId);
  if (!Number.isInteger(filmId) || filmId < 1)
    return writer.writeJson(res, { error: 'filmId must be a positive integer' }, 400);

  const invitations = req.body;
  if (!Array.isArray(invitations) || invitations.length === 0)
    return writer.writeJson(res, { error: 'The body must be a non-empty list of review invitations' }, 400);

  const invited = new Set();
  for (const invitation of invitations) {
    // An invitation is a review that is not completed yet
    if (invitation === null || invitation.completed === true || !validators.validateReview({ completed: false, ...invitation }))
      return writer.writeJson(res, { error: 'The body contains an invalid review invitation' }, 400);
    // The film of every invitation must be the one of the path
    if (invitation.filmId !== filmId)
      return writer.writeJson(res, { error: 'Every invitation must refer to the film of the path' }, 400);
    if (invited.has(invitation.reviewerId))
      return writer.writeJson(res, { error: 'The same user cannot be invited twice' }, 400);
    invited.add(invitation.reviewerId);
  }

  try {
    // No invitation must be created if one of the users has already been invited
    // (the service would create the previous ones before failing)
    for (const invitation of invitations) {
      try {
        await reviewsService.getSingleReview(filmId, invitation.reviewerId);
        return writer.writeJson(res, { error: ERRORS.EXISTING_REVIEW[1] }, 409);
      } catch (err) {
        if (err !== 'NO_REVIEWS')
          throw err;
      }
    }

    const created = await reviewsService.issueFilmReview(invitations, req.user.id);
    writer.writeJson(res, links.addToReview(created), 201);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};
