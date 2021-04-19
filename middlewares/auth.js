const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const UnauthorizedErr = require('../errors/unauthorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const isAuthorized = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    const unauthorizedErr = new UnauthorizedErr('Требуется авторизация');
    return next(unauthorizedErr);
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    UserModel.findOne({ _id: payload._id })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь не существует');
        }
        req.user = payload;
        return next();
      })
      .catch(next);
  } catch (error) {
    const forbiddenError = new ForbiddenError('Нет доступа');
    return next(forbiddenError);
  }

  return true;
};

module.exports = { isAuthorized };
