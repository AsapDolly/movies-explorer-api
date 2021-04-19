const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedErr = require('../errors/unauthorized-err');
const BadRequestErr = require('../errors/bad-request-err');
const ConflictErr = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;
const MONGO_DUPLICATE_ERROR_CODE = 11000;

function createUser(req, res, next) {
  const {
    password, ...data
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashPassword) => UserModel.create({ password: hashPassword, ...data }))
    .then((user) => res.status(201).send({ data: { _id: user._id, email: user.email } }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const validationError = new BadRequestErr('Переданы некорректные данные');
        return next(validationError);
      }
      if (err.name === 'MongoError' && err.code === MONGO_DUPLICATE_ERROR_CODE) {
        const duplicateError = new ConflictErr('Такой пользователь уже существует');
        return next(duplicateError);
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  UserModel.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedErr('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedErr('Неправильные почта или пароль');
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
}

function getUserInfo(req, res, next) {
  UserModel.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Нет пользователя с таким id');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        const castError = new BadRequestErr('Переданы некорректные данные');
        return next(castError);
      }
      return next(err);
    });
}

function updateUserInfo(req, res, next) {
  const { name, email } = req.body;
  UserModel.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Нет пользователя с таким id');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const validationError = new BadRequestErr('Переданы некорректные данные');
        return next(validationError);
      }
      return next(err);
    });
}

module.exports = {
  createUser,
  login,
  getUserInfo,
  updateUserInfo,
};
