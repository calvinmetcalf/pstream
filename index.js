'use strict';
var inherits = require('inherits');
var Transform = require('readable-stream').Transform;
var fork =  require('child_process').fork;

inherits(PStream, Transform);
module.exports = PStream;

function PStream(script, number, opts) {
  if (typeof number !== 'number') {
    opts = number;
    number = 3;
  }
  opts = opts || {};
  Transform.call(this, opts);
  this.script = script;
  this.children = [];
  this.opts = opts;
  var i = -1;
  this.available = [];
  this.pending = 0;
  while (++i < number) {
    this.makeChild(i);
  }
}
PStream.prototype.makeChild = function (i) {
  var self = this;
  this.children[i] = fork('./script.js', [this.script]);
  
  this.children[i].on('message', function (e) {
    if (e.type === 'push') {
      self.push(e.data);
    } else if (e.type === 'error') {
      self.emit('error', e.data);
    } else if (e.type === 'done') {
      if (typeof e.data !== 'undefined') {
        self.push(e.data);
      }
      self.next(i);
    }
  });
  this.available.push(i);
};
PStream.prototype.next = function (i) {
  this.available.push(i);
  this.pending--;
  this.emit('availableChildren');
};
PStream.prototype.cleanUp = function () {
  this.children.forEach(function (child) {
    child.kill();
  }, this);
};
PStream.prototype.dealChunk = function (i, chunk, _, next) {
  this.pending++;
  this.children[i].send({
    chunk: chunk,
    encoding: _,
    type: 'data'
  });
  next();
};
PStream.prototype._transform = function (chunk, _, next) {
  var self = this;
  if (this.available.length) {
    this.dealChunk(this.available.shift(), chunk, _, next);
  } else {
    this.once('availableChildren', function () {
      if (self.available.length) {
        self.dealChunk(self.available.shift(), chunk, _, next);
      }
    });
  }
};
PStream.prototype._flush = function (next) {
  var self = this;
  if (this.pending) {
    this.on('availableChildren', function () {
      if (!self.pending) {
        self.cleanUp();
        next();
      }
    });
  } else {
    this.cleanUp();
    next();
  }
};