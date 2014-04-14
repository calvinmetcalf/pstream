pstream [![Build Status](https://travis-ci.org/calvinmetcalf/pstream.svg)](https://travis-ci.org/calvinmetcalf/pstream)
====

process a stream with which is processed in multiple parallel queues, e.g. instead of the default setup which is to process the stream sequentially, this processes multiple pieces of data at the same time, the api is identical to [through2](https://github.com/rvagg/through2) with `pStream([ options, ] [ transformFunction ] [, flushFunction ])` (though no `.obj` short cut), the options take an optional `number` argument which signifies now many parallel tasks can go on at the same time. Defaults to 3 for no particular reason. If options are a number that is a shortcut to `{number: thatNumber}`

The order of the output stream will *NOT* necessarily be the same as the input stream.