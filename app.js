require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const path = require('path');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3001 } = process.env;
const usersRouter = require('./routes/users.js');
const moviesRouter = require('./routes/movies.js');
const { login, createUser } = require('./controllers/users');
const { isAuthorized } = require('./middlewares/auth');

const options = {
  origin: [
    'http://imekov.bitfilms.nomoredomains.icu',
    'https://imekov.bitfilms.nomoredomains.icu',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

const app = express();

app.use('*', cors(options));

app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', isAuthorized, usersRouter);
app.use('/movies', isAuthorized, moviesRouter);

app.use(isAuthorized, (req, res, next) => {
  const notFoundError = new NotFoundError('Запрашиваемый ресурс не найден');
  next(notFoundError);
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
