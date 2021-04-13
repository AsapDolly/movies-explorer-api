const MovieModel = require('../models/movie');
const BadRequestErr = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

function getMovies(req, res, next) {
  MovieModel.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country, director, duration, year, description, image,
    thumbnail, trailer, nameRU, nameEN, movieId,
  } = req.body;

  MovieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    thumbnail,
    trailer,
    nameRU,
    nameEN,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const validationError = new BadRequestErr('Переданы некорректные данные');
        return next(validationError);
      }
      return next(err);
    });
}

function deleteMovie(req, res, next) {
  MovieModel.findById(req.params.movieId)
    .then((data) => {
      if (data.owner.equals(req.user._id)) {
        MovieModel.findByIdAndRemove(req.params.movieId)
          .orFail(() => {
            throw new NotFoundError('Фильм не найден');
          })
          .then((movie) => res.send({ data: movie }))
          .catch((err) => {
            if (err.name === 'CastError') {
              const castError = new BadRequestErr('Переданы некорректные данные');
              return next(castError);
            }
            return next(err);
          });
      } else {
        const forbiddenError = new ForbiddenError('Нет доступа');
        return next(forbiddenError);
      }
      return data;
    })
    .catch(() => {
      const notFoundError = new NotFoundError('Фильм не найден');
      return next(notFoundError);
    });
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
