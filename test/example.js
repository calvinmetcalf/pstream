'use strict';
module.exports = function (chunk, _, next) {
  this.push({
    number: chunk,
  });
  var self = this;
  setTimeout(function () {
    self.push({
      number: chunk,
    });
    next();
  }, 10);
};