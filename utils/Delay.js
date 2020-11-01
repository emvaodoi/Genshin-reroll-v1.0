module.exports = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};
