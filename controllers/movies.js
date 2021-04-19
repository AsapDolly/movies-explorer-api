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
  const { ...data } = req.body;

  MovieModel.create({ ...data, owner: req.user._id })
    .then((movie) => res.status(201).send({
      country: movie.country,
      director: movie.director,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      image: movie.image,
      thumbnail: movie.thumbnail,
      trailer: movie.trailer,
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
      movieId: movie.movieId,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const validationError = new BadRequestErr('Переданы некорректные данные');
        return next(validationError);
      }
      return next(err);
    });
}

function deleteMovie(req, res, next) {
  MovieModel.findById(req.params._id).select('+owner')
    .orFail(() => {
      throw new NotFoundError('Фильм не найден');
    })
    .then((data) => {
      if (data.owner.equals(req.user._id)) {
        MovieModel.findByIdAndRemove(req.params._id)
          .then((movie) => res.send({ data: movie }))
          .catch((err) => {
            if (err.name === 'CastError') {
              const castError = new BadRequestErr('Переданы некорректные данные');
              return next(castError);
            }
            return next(err);
          });
      } else {
        throw new ForbiddenError('Нет доступа');
      }
    })
    .catch((err) => next(err));
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
