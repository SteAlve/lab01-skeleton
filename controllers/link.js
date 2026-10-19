'use strict';

/**
 * Replace every /change/me placeholder with the URI of the corresponding
 * operation defined in the OpenAPI document.
 */
module.exports.getFilmManager = function getFilmManager() {
  return {
    films: '/change/me',
    privateFilms: '/change/me',
    publicFilms: '/change/me',
    invitedPublicFilms: '/change/me',
    reviewAssignments: '/change/me',
    users: '/change/me',
    usersAuthenticator: '/change/me'
  };
};

/**
 * These functions can be used on the response of a controller to add the self link or the link to other resources according to the HATEOAS principles.
 */
module.exports.addToFilm = function addToFilm(response) {
  return response;
};

module.exports.addToUser = function addToUser(response) {
  return response;
};


module.exports.addToReview = function addToReview(response) {
  return response;
};
