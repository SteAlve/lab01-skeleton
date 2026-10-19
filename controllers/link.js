'use strict';

/**
 * Replace every /change/me placeholder with the URI of the corresponding
 * operation defined in the OpenAPI document.
 */
module.exports.getFilmManager = function getFilmManager() {
  return {
    films: '/api/films',
    privateFilms: '/api/films/private',
    publicFilms: '/api/films/public',
    invitedPublicFilms: '/api/films/public/invited',
    reviewAssignments: '/api/films/public/assignments',
    users: '/api/users',
    usersAuthenticator: '/api/users/authenticator'
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
