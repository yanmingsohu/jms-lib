var jfact = require('java-factory-lib');
var java = jfact.getJavaInstance();


module.exports.open = open;


function open(opt, event) {

  var Hashtable      = java.import('java.util.Hashtable');
  var Context        = java.import('javax.naming.Context');
  var InitialContext = java.import('javax.naming.InitialContext');

  var factProviderUrl = 't3://' + opt.host + ':' + opt.port;
  var jndiFactoryName = "weblogic.jndi.WLInitialContextFactory";
  var ConnFactName    = 'weblogic.jms.ConnectionFactory';

  var properties = new Hashtable();
  properties.putSync(Context.INITIAL_CONTEXT_FACTORY, jndiFactoryName);
  properties.putSync(Context.PROVIDER_URL,            factProviderUrl);
  properties.putSync(Context.SECURITY_PRINCIPAL,      opt.user);
  properties.putSync(Context.SECURITY_CREDENTIALS,    opt.pass);

  var ctx = new InitialContext(properties);
  var fact = ctx.lookupSync(ConnFactName);


  function createConnection() {
    return fact.createConnectionSync();
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
    name              : 'Oracle WebLogic Server'
  };
}


function printobj(o) {
  for (var n in o) {
    console.log('>>', n, o[n]);
  }
}