var jfact = require('java-factory-lib');
var java = jfact.getJavaInstance();


module.exports.open = open;


function open(opt, event) {

  var ConnectionFactory  = java.import('com.sun.messaging.ConnectionFactory');
  var CConfiguration     = java.import('com.sun.messaging.ConnectionConfiguration');
  // var Queue              = java.import('com.sun.messaging.Queue');
  // var Topic              = java.import('com.sun.messaging.Topic');
  

  var fact = new ConnectionFactory();
  fact.setPropertySync(CConfiguration.imqDefaultPassword, opt.pass);
  fact.setPropertySync(CConfiguration.imqDefaultUsername, opt.user);
  fact.setPropertySync(CConfiguration.imqBrokerHostName,  opt.host);
  fact.setPropertySync(CConfiguration.imqBrokerHostPort,  String(opt.port));


  function createConnection() {
    return fact.createConnectionSync();
  }


  function getVersion() {
    var Version = java.import('com.sun.messaging.Version');
    var version = new Version();
    return version.getImplementationVersionSync();
  }


  return {
    createConnection  : createConnection,
    version           : getVersion(),
    name              : 'GlassFish(tm) Server Message Queue'
  };
}