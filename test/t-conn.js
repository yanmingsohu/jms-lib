
module.exports = test;


function test(jms, _opt) {
  var i = -1;

  // 会抛出异常, 在连接失败的时候
  var conn = jms.open(_opt);
  console.log(conn);

  var sess = conn.createSession();
  var prod = sess.createProducer('test');

  while (++i < 5) {
    console.log('send', i)
    prod.send(null);
    prod.send('hello jms ' + i);
    prod.send(getBuffer());
    prod.send({a:1, b:2 }); // ActiveMQ 发送不了map
  }

  var cons = sess.createConsumer('test');

  cons.onData(data_listener);
  conn.start();
  console.log('start');

  setTimeout(function() {
    conn.close();
  }, 20000);


  function completionListener(err, msg) {
    console.log(err);
  }

  function data_listener(type, msg) {
    console.log('Recv <', type, ">\t", msg);
  }

  function getBuffer() {
    var ret = new Buffer(10);
    for (var i=0, e=ret.length; i<e; ++i) {
      ret[i] = i;
    }
    return ret;
  }
}