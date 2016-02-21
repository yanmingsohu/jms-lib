var jfact = require('java-factory-lib');
var java = jfact.getJavaInstance();


module.exports.open = open;


function open(opt, event) {

  var NettyConnectorName = 'org.hornetq.core.remoting.impl.netty.NettyConnectorFactory';
  var ConnectionFactory  = java.import('org.hornetq.jms.client.HornetQConnectionFactory');
  var HashMap            = java.import('java.util.HashMap');
  var TransportConfig    = java.import('org.hornetq.api.core.TransportConfiguration');
  var TransportConstants = java.import('org.hornetq.core.remoting.impl.netty.TransportConstants');

  var map = new HashMap();
  map.putSync(TransportConstants.HOST_PROP_NAME, opt.host);
  map.putSync(TransportConstants.PORT_PROP_NAME, opt.port);

  var config = new TransportConfig(NettyConnectorName, map);
  var fact = new ConnectionFactory(false, config);


  function createConnection() {
    return fact.createConnectionSync(opt.user, opt.pass);
  }


  function getVersion() {
    var conn = createConnection();
    var meta = conn.getMetaDataSync();
    var version = meta.getProviderVersionSync();
    conn.closeSync();
    return version;
  }


  return {
    createConnection  : createConnection,
    version           : getVersion(),
    name              : 'JBoss HornetQ'
  };
}