'use strict';
var PStream = require('../');
var through = require('through2').obj;
var test = require('tape');
var path = require('path');

function makeData(x) {
  var i = -1;
  var out = through();
  while (++i < x) {
    out.write(i);
  }
  out.end();
  return out;
}

test('it works', function (t) {
  var stream = new PStream({
    objectMode: true
  }, function (chunk, _, next) {
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
  });
  var last = -1;
  var smaller;
  makeData(15).pipe(stream).pipe(through(function (chunk, _, next) {
    if (last > chunk.number) {
      smaller = true;
    }
    last = chunk.number;
    next();
  }, function (next) {
    t.ok(smaller, 'should be out of order');
    t.end();
    next();
  }));
});
test('configurable number of processes', function (t) {
  var stream = PStream({
    objectMode: true,
    number: 1
  }, function (chunk, _, next) {
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
  });
  var last = -1;
  var smaller;
  makeData(15).pipe(stream).pipe(through(function (chunk, _, next) {
    if (last > chunk.number) {
      smaller = true;
    }
    last = chunk.number;
    next();
  }, function (next) {
    t.ok(!smaller, 'should be out of order');
    t.end();
    next();
  }));
});