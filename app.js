require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const helmet = require('helmet');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const mainRouter = require('./routes/index');
const errorRouter = require('./errors/index');

const { PORT = 3000, NODE_ENV, DB_CONNECTION_STRING } = process.env;

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
app.use(helmet());

app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(NODE_ENV === 'production' ? DB_CONNECTION_STRING : 'mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
