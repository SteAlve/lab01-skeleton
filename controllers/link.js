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
 * Each function accepts either a single resource or an array of resources.
 */
module.exports.addToFilm = function addToFilm(response) {
  const addLinks = (film) => {
    if (!film) return film;

    const links = {
      self: film.private ? `/api/films/${film.id}` : `/api/films/public/${film.id}`
    };
    if (!film.private)
      links.reviews = `/api/films/public/${film.id}/reviews`;

    return { ...film, ...links };
  };

  return Array.isArray(response) ? response.map(addLinks) : addLinks(response);
};

module.exports.addToUser = function addToUser(response) {
  const addLinks = (user) => {
    if (!user) return user;

    return { ...user, self: `/api/users/${user.id}` };
  };

  return Array.isArray(response) ? response.map(addLinks) : addLinks(response);
};


module.exports.addToReview = function addToReview(response) {
  const addLinks = (review) => {
    if (!review) return review;

    return { ...review, self: `/api/films/public/${review.filmId}/reviews/${review.reviewerId}` };
  };

  return Array.isArray(response) ? response.map(addLinks) : addLinks(response);
};
