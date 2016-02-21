var jms = require('../index.js');
jms.initJava(require('java'));


var opt = [{
  driver: 'OpenMQ',
  host: 'localhost',
  port: 7676,
  user: 'admin',
  pass: 'admin'
}, {
  driver: 'ActiveMQ',
  host: 'localhost',
  port: 61616,
  user: 'admin',
  pass: 'admin'
}, {
  driver: 'HornetQ',
  host: 'localhost',
  port: 5455,
  user: 'guest',
  pass: 'guest'
}, {
  driver: 'ibmMQ',
  host: 'localhost',
  port: 1414,
  user: 'admin',
  pass: 'admin'
}, {
  driver: 'WebLogic',
  host: 'localhost',
  port: 7001,
  user: 'test',
  pass: '12345678abc'
}];


try {
  // opt.forEach(function() {});
  require('./t-conn.js')(jms, opt[4]);
} catch(err) {
  console.log(err.stack)
}
