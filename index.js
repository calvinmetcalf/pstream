'use strict';
var inherits = require('inherits');
var Transform = require('readable-stream').Transform;

inherits(PStream, Transform);
module.exports = PStream;

function PStream(opts, transform, flush) {
  if (!(this instanceof PStream)) {
    return new PStream(opts, transform, flush);
  }
  if (typeof opts === 'function') {
    flush = transform;
    transform = opts;
    opts = {};
  }
  if (typeof opts === 'number') {
    opts = {
      number: opts
    };
  }
  Transform.call(this, opts);
  this.available = opts.number || 3;
  this.pending = 0;
  this.__transform = transform;
  this.__flush = flush;
}
PStream.prototype.next = function (i) {
  this.available++;
  this.pending--;
  this.emit('chunkFinished');
};
PStream.prototype.cleanUp = function () {
  this.children.forEach(function (child) {
    child.kill();
  }, this);
};
PStream.prototype.dealChunk = function (chunk, _, next) {
  var self = this;
  this.available--;
  this.pending++;
  this.__transform.call({
    push: function (thing) {
      self.push(thing);
    }
  }, chunk, _, function (err, data) {
    if (err) {
      self.emit('error', err);
    } else {
      if (data !== null && data !== undefined) {
        self.push(data);
      }
      self.next();
    }
  });
  next();
};
PStream.prototype._transform = function (chunk, _, next) {
  var self = this;
  if (this.available) {
    this.dealChunk(chunk, _, next);
  } else {
    this.once('chunkFinished', function () {
      if (self.available) {
        self.dealChunk(chunk, _, next);
      }
    });
  }
};
PStream.prototype.cleanUp = function (next) {
  this.removeAllListeners('chunkFinished');
  if (typeof this.__flush === 'function') {
    this.__flush(next);
  } else {
    next();
  }
};
PStream.prototype._flush = function (next) {
  var self = this;
  if (this.pending) {
    this.on('chunkFinished', function () {
      if (!self.pending) {
        self.cleanUp(next);
      }
    });
  } else {
    this.cleanUp(next);
  }
};