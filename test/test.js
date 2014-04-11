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
  var stream = new PStream(path.join(__dirname, './example'), 3, {
    objectMode: true
  });
  t.plan(30);
  makeData(15).pipe(stream).pipe(through(function (chunk, _, next) {
    t.ok(true, JSON.stringify(chunk, null, 4));
    next();
  }, function (next) {
    t.end();
    next();
  }));
});