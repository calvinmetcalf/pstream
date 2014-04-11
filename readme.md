pstream
====

Split a stream up into multiple parallel streams in different processes that are evaluated at the same time, takes 3 arguments, script, which is the path to the script, children, which is the number of child processes to create (default 3), and options which are passed to the Transform stream constructor.

```javascript
// main file
var PStream = require('pstream');
var stream = new PStream('./myScript', 3, {objectMode: true});

// myScript.js
module.exports = function (chunk, encoding, next) {
  //stuff
}
```

they script you call needs to export a function which behaves like the `_transform` methods of a transform stream, you can push with `this.push` and it has the exact same 3 arguments.

This is extremely experimental with any gains from parallelization probably eaten up by message passing overhead.

The order of the output stream will *NOT* necessarily be the same as the input stream.