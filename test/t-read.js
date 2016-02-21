var java     = require('java');
var stream   = require('stream');
var Readable = stream.Readable;


// var ja = java.newArray('byte', [1,2]);
// console.log(ja, ja[0], ja.length);

var r = new Readable();

r._len = 100;
r._i = 0;

r._read = function(size) {
  var rr = -1;

  if (size + this._i < this._len) {
    rr = size;
  } else {
    rr = this._len - this._i;
    if (rr <= 0) {
      this.push();
      return;
    }
  }

  var ret = new Buffer(rr);
  for (var i = 0, e = ret.length; i < e; ++i) {
    ret[i] = this._i + i;
  }
  this.push(ret);
  this._i += rr;

  console.log('require', size, 'get', rr);
};


r.pipe(process.stdout);