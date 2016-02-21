var jfact = require('java-factory-lib');
var java = jfact.getJavaInstance();


module.exports.open = open;


function open(opt, event) {

  var ConnectionFactory  = java.import('org.apache.activemq.ActiveMQConnectionFactory');

  var url  = 'tcp://' + opt.host + ':' + opt.port;
  var fact = new ConnectionFactory(opt.user, opt.pass, url);


  function createConnection() {
    return fact.createConnectionSync();
  }


  function getVersion() {
    var conn = fact.createConnectionSync();
    var meta = conn.getMetaDataSync();
    var version = meta.getProviderVersionSync();
    conn.closeSync();
    return version;
  }


  return {
    createConnection  : createConnection,
    version           : getVersion(),
    name              : 'Apache ActiveMQ'
  };
}