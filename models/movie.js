const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /https?:\/\/(w{3}\.)?([\w\-0-9]+\.)+[a-z]{2,}\/?([0-9a-z\-._~:/?#[]@!$&'()*\+,;=]*)?/gi.test(v);
      },
      message: 'Некорректная ссылка на картинку.',
    },
  },
  trailer: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /https?:\/\/(w{3}\.)?([\w\-0-9]+\.)+[a-z]{2,}\/?([0-9a-z\-._~:/?#[]@!$&'()*\+,;=]*)?/gi.test(v);
      },
      message: 'Некорректная ссылка на картинку.',
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /https?:\/\/(w{3}\.)?([\w\-0-9]+\.)+[a-z]{2,}\/?([0-9a-z\-._~:/?#[]@!$&'()*\+,;=]*)?/gi.test(v);
      },
      message: 'Некорректная ссылка на картинку.',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
