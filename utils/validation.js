const validateURL = (value, helpers) => {
  const isLinkCorrect = /https?:\/\/(w{3}\.)?([\w\-0-9]+\.)+[a-z]{2,}\/?([0-9a-z\-._~:/?#[]@!$&'()*\+,;=]*)?/gi.test(value);

  if (!isLinkCorrect) {
    return helpers.error('any.invalid');
  }

  return value;
};

module.exports = { validateURL };
