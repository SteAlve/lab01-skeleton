'use strict';

const writer = require('../utils/writer.js');
const links = require('./link.js');
const validators = require('./validators.js');
const reviewsService = require('../service/ReviewsService.js');

const ERRORS = {
  NO_REVIEWS: [404, 'The review does not exist'],
  USER_NOT_OWNER: [403, 'Only the owner of the film can perform this operation'],
  ALREADY_COMPLETED: [409, 'The review has already been completed']
};

/**
 * Retrieve a review of a public film
 * The review of the public film with ID filmId issued to the user with ID reviewerId is retrieved.
 * This operation does not require authentication.
 **/
module.exports.getSingleReview = async function getSingleReview(req, res, next) {
  const filmId = Number(req.params.filmId);
  const reviewerId = Number(req.params.reviewerId);
  if (!Number.isInteger(filmId) || filmId < 1 || !Number.isInteger(reviewerId) || reviewerId < 1)
    return writer.writeJson(res, { error: 'filmId and reviewerId must be positive integers' }, 400);

  try {
    const review = await reviewsService.getSingleReview(filmId, reviewerId);
    writer.writeJson(res, links.addToReview(review), 200);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Complete a review
 * The review of the film with ID filmId issued to the user with ID reviewerId is completed.
 * This operation can be performed only by the invited reviewer.
 **/
module.exports.updateSingleReview = async function updateSingleReview(req, res, next) {
  const filmId = Number(req.params.filmId);
  const reviewerId = Number(req.params.reviewerId);
  if (!Number.isInteger(filmId) || filmId < 1 || !Number.isInteger(reviewerId) || reviewerId < 1)
    return writer.writeJson(res, { error: 'filmId and reviewerId must be positive integers' }, 400);

  const review = req.body;
  if (!review || typeof review !== 'object')
    return writer.writeJson(res, { error: 'The body must be a review' }, 400);

  // The ids in the body, if present, must be the ones of the path
  if ((review.filmId !== undefined && review.filmId !== filmId) || (review.reviewerId !== undefined && review.reviewerId !== reviewerId))
    return writer.writeJson(res, { error: 'The ids in the body are different from the ones in the path' }, 400);

  // This operation only allows setting "completed" to true
  if (review.completed !== true || !validators.validateReview({ ...review, filmId: filmId, reviewerId: reviewerId }))
    return writer.writeJson(res, { error: 'The body is not a valid completed review', errors: validators.validateReview.errors }, 400);

  try {
    const existing = await reviewsService.getSingleReview(filmId, reviewerId);

    // Only the invited reviewer can complete the review
    if (req.user.id !== reviewerId)
      return writer.writeJson(res, { error: 'Only the invited reviewer can complete the review' }, 403);

    if (existing.completed)
      return writer.writeJson(res, { error: ERRORS.ALREADY_COMPLETED[1] }, 409);

    await reviewsService.updateSingleReview(review, filmId, reviewerId);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};

/**
 * Delete a review invitation
 * The review of the film with ID filmId issued to the user with ID reviewerId is deleted.
 * This operation can be performed only by the owner of the film, and only if the review is not completed.
 **/
module.exports.deleteSingleReview = async function deleteSingleReview(req, res, next) {
  const filmId = Number(req.params.filmId);
  const reviewerId = Number(req.params.reviewerId);
  if (!Number.isInteger(filmId) || filmId < 1 || !Number.isInteger(reviewerId) || reviewerId < 1)
    return writer.writeJson(res, { error: 'filmId and reviewerId must be positive integers' }, 400);

  try {
    await reviewsService.deleteSingleReview(filmId, reviewerId, req.user.id);
    writer.writeJson(res, null, 204);
  } catch (err) {
    const [code, message] = ERRORS[err] || [500, 'Internal server error'];
    writer.writeJson(res, { error: message }, code);
  }
};
