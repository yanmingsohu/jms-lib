var jfact = require('java-factory-lib');
var java = jfact.getJavaInstance();


module.exports.open = open;


function open(opt, event) {

  var JmsFactoryFactory = java.import('com.ibm.msg.client.jms.JmsFactoryFactory');
  var JmsConstants      = java.import('com.ibm.msg.client.jms.JmsConstants');
  var WMQConstants      = java.import('com.ibm.msg.client.wmq.common.CommonConstants');

  var FactoryFactory = JmsFactoryFactory.getInstanceSync(JmsConstants.WMQ_PROVIDER);
  var fact = FactoryFactory.createConnectionFactorySync();


  fact.setStringPropertySync(WMQConstants.WMQ_HOST_NAME, opt.host);
  fact.setIntPropertySync(WMQConstants.WMQ_PORT,         Number(opt.port));
  fact.setStringPropertySync(JmsConstants.USERID,        opt.user);
  fact.setStringPropertySync(JmsConstants.PASSWORD,      opt.pass);

  fact.setStringPropertySync(WMQConstants.WMQ_APPLICATIONNAME, "JMS-NODE-LIB");
  fact.setIntPropertySync(WMQConstants.WMQ_CONNECTION_MODE, WMQConstants.WMQ_CM_CLIENT);

  var version = fact.getStringPropertySync(WMQConstants.WMQ_VERSION);


  function createConnection() {
    return fact.createConnectionSync();
  }


  function getVersion() {
    return version;
  }


  return {
    createConnection  : createConnection,
    version           : getVersion(),
    name              : 'IBM WebSphere MQ'
  };
}