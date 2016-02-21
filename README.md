# Java Message Services Client

> 多种 jms 服务器的支持


`install npm jms-lib --save`


## 驱动支持

* OpenMQ    -- GlassFish(tm) Server Message Queue
* ActiveMQ  -- Apache ActiveMQ
* HornetQ   -- JBoss HornetQ
* ibmMQ     -- IBM WebSphere MQ
* WebLogic  -- Oracle WebLogic MQ


## Usage

```js
var jms = require('jms-lib');
jms.initJava(require('java'));

// 到 jms 服务器的连接配置
var opt = {
  driver: 'OpenMQ',
  host: 'localhost',
  port: 7676,
  user: 'admin',
  pass: 'admin'
};

// 在连接失败的时候会抛出异常
var conn = jms.open(opt);

var sess = conn.createSession();

// 从一个主题名称生成消息创建者, isTopic -- true 创建订阅主题目标
var prod = sess.createProducer('test', isTopic);

// 发送各种消息
prod.send(null);
prod.send('hello jms');
prod.send(new Buffer(10));

// 只能发送简单对象, 不允许深度对象嵌套
prod.send({ a:1, b:2 });

// 从一个主题名称生成消息消费者
var cons = sess.createConsumer('test', {
    name            : 'SubscriptionName',
    messageSelector : string,
    noLocal         : boolean,
    shared          : boolean, 共享的默认 true
    durable         : boolean, 持久化的默认 false
});

// 监听消息, 注意当最后一个 v8 任务结束后, 进程会退出
// type -- Text 返回字符串, Bytes 返回 Buffer, Map 返回对象
//         Object 返回 java 对象, Stream 返回 stream.Readable
cons.onData(function(type, msg) {
  console.log(type, msg);
});

// not_wait - false 等待 timeout 时间同步获取消息
// 如果等待了 timeout 或 not_wait==true 可能返回 null
var msg = cons.receive(timeout, not_wait);

// 开始接受消息
conn.start();

// 关闭连接
conn.close();
```


## JAR 依赖

* JMS 接口
    - jms.jar

* GlassFish(tm) Server Message Queue OpenMQ
    - imq.jar
    - imq_l10n.jar
    - imqxm.jar

* WebLogic Server
    - wlclient.jar
    - wljmsclient.jar

* Apache ActiveMQ ™ 
    - activemq-client-5.11.1.jar
    - geronimo-j2ee-management_1.1_spec-1.0.1.jar
    - slf4j-api-1.7.10.jar

* JBoss HornetQ
    - hornetq-jms-client.jar
    - hornetq-core-client.jar
    - hornetq-commons.jar
    - jnp-client.jar
    - netty.jar

* IBM WebSphere MQ
    - com.ibm.mq.allclient.jar
    - com.ibm.mq.traceControl.jar
    - fscontext.jar
    - JSON4J.jar
    - providerutil.jar


## 参考

* [GlassFish Message Queue](http://docs.oracle.com/cd/E19798-01/821-1796/aeqax/index.html)
* [WebLogic JMS](http://docs.oracle.com/cd/E13222_01/wls/docs103/jms/fund.html)
* [Apache ActiveMQ](http://activemq.apache.org/maven/5.11.0/apidocs/index.html)
* [JBoss HornetQ](http://docs.jboss.org/hornetq/2.4.0.Final/docs/api/hornetq-jms-client/)
* [IBM WebSphere MQ](http://www-01.ibm.com/support/knowledgecenter/SSFKSJ_7.5.0/com.ibm.mq.javadoc.doc/WMQJMSClasses/index.html)


* [实现独立于供应商的 JMS 解决方案](http://www.ibm.com/developerworks/cn/java/j-jmsvendor/index.html)
* [用JMS进行企业消息传递](http://www.ibm.com/developerworks/cn/java/j-pj2ee5/)