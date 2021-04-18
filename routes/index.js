const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./users.js');
const moviesRouter = require('./movies.js');
const { login, createUser } = require('../controllers/users');
const { isAuthorized } = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

router.use('/users', isAuthorized, usersRouter);
router.use('/movies', isAuthorized, moviesRouter);

router.use(isAuthorized, (req, res, next) => {
  const notFoundError = new NotFoundError('Запрашиваемый ресурс не найден');
  next(notFoundError);
});

module.exports = router;
