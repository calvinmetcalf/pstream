'use strict';
var script = require(process.argv[2]);
var obj = {
  push: function (thing) {
    process.send({
      type: 'push',
      data: thing
    });
  }
};
function callback(err, msg) {
  if (err) {
    process.send({
      type: 'error',
      data: err
    });
  } else {
    process.send({
      type: 'done',
      data: msg
    });
  }
}
process.on('message', function (e) {
  if (e.type !== 'data') {
    return;
  }
  script.call(obj, e.chunk, e.encoding, callback);
});