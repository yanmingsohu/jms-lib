var stream   = require('stream');
var jfact    = require('java-factory-lib');
var java     = jfact.getJavaInstance();
var Readable = stream.Readable;


module.exports.open = open;


//
// jms 通用方法绑定
//
// opt    -- 创建选项
// drvimp -- 驱动实现
// event  -- 事件监听器
//
function open(opt, drvimp, event) {

  var DeliveryMode  = java.import('javax.jms.DeliveryMode');
  var Session       = java.import('javax.jms.Session');
  var conn          = drvimp.createConnection();
  var nullobj       = {};
  var undefined;


  function bind_noarg_fn(obj, name) {
    name += 'Sync';
    return function() {
      return obj[name]();
    };
  }


  function start() { 
    return conn.startSync();
  }

  //
  // name -- 队列/主题名称
  // _s_opt -- { transacted:boolean, acknowledgeMode:int}
  //
  function createSession(_s_opt) {
    if (!_s_opt) _s_opt = nullobj;

    var jsess = conn.createSessionSync(
                _s_opt.transacted || false, 
                _s_opt.acknowledgeMode || Session.AUTO_ACKNOWLEDGE);

    var sess = {
      createConsumer : createConsumer,
      createProducer : createProducer,
      close          : bind_noarg_fn(jsess, 'close'),
      commit         : bind_noarg_fn(jsess, 'commit'),
      recover        : bind_noarg_fn(jsess, 'recover'),
      rollback       : bind_noarg_fn(jsess, 'rollback'),
    };


    //
    // 当 shared == true || durable == true 认为是订阅模式 
    //
    // name   -- '消息主题名称'
    // _c_opt -- {
    //   name            : 'SubscriptionName',
    //   messageSelector : string,
    //   noLocal         : boolean,
    //   shared          : boolean, 共享的默认 true
    //   durable         : boolean, 持久化的默认 false
    // }
    //
    function createConsumer(name, _c_opt) {
      var dest;
      var cons;
      if (!_c_opt) _c_opt = nullobj;

      if (_c_opt.shared || _c_opt.durable) {
        dest = jsess.createTopicSync(name);
      } else {
        dest = jsess.createQueueSync(name);
      }

      if (_c_opt.shared) {
        if (_c_opt.durable) {
          cons = jsess.createSharedDurableConsumerSync(
            dest, _c_opt.name, _c_opt.messageSelector);
        } else {
          cons = jsess.createSharedConsumerSync(
            dest, _c_opt.name, _c_opt.messageSelector);
        }
      } else {
        if (_c_opt.durable) {
          cons = jsess.createDurableConsumerSync(
            dest, _c_opt.name, _c_opt.messageSelector, _c_opt.noLocal || false);
        } else {
          cons = jsess.createConsumerSync(
            dest, _c_opt.messageSelector, _c_opt.noLocal || false);
        }
      }

      return Consumer(cons);
    }


    function createProducer(name, isTopic) {
      if (isTopic) {
        dest = jsess.createTopicSync(name);
      } else {
        dest = jsess.createQueueSync(name);
      }

      var prod = jsess.createProducerSync(dest);
      return Producer(prod);
    }


    function Consumer(_cobj) {
      var ret = {
        close   : bind_noarg_fn(_cobj, 'close'),
        receive : receive,
        onData  : onData,
      };


      function convert(msg) {
        var ret = { type: -1, msg: null };

        if ( java.instanceOf(msg, 'javax.jms.TextMessage') ) {
          ret.type = 'Text';
          ret.msg  = msg.getTextSync();
        } 
        else if ( java.instanceOf(msg, 'javax.jms.BytesMessage') ) {
          ret.type = 'Bytes';
          var len  = Number(msg.getBodyLengthSync().longValue);
          var r    = ret.msg = new Buffer(len);

          for (var i=0; i<r.length; ++i) {
            r[i] = msg.readByteSync();
          }
        } 
        else if ( java.instanceOf(msg, 'javax.jms.MapMessage') ) {
          ret.type  = 'Map';
          var names = msg.getMapNamesSync();
          var r     = ret.msg = {};

          while (names.hasMoreElementsSync()) {
            var n = names.nextElementSync();
            r[n]  = msg.getObjectSync(n);
          }
        } 
        else if ( java.instanceOf(msg, 'javax.jms.ObjectMessage') ) {
          ret.type = 'Object';
          ret.msg  = msg.getObjectSync();
        } 
        else if ( java.instanceOf(msg, 'javax.jms.StreamMessage') ) {
          ret.type   = 'Stream';
          var reader = ret.msg = new Readable();
          var isEnd  = false;

          reader._read = function(size) {
            if (isEnd) return this.push(null);
            var buf = new Buffer(size);
            var i = 0;

            try {
              while (i < r.length) {
                buf[i] = msg.readByteSync();
                ++i
              }
            } catch(err) {
              this.push(buf.slice(0, i));
              isEnd = true;
            }
          };
        } 
        else {
          ret.type = 'Null';
          ret.msg = null;
        }

        return ret;
      }


      function receive(timeout, not_wait) {
        var msg;
        if (not_wait) {
          msg = convert_cobj.receiveNoWaitSync();
        }
        else if (timeout) {
          msg = _cobj.receiveSync(timeout);
        }
        else {
          msg = _cobj.receiveSync();
        }
        return msg && convert(msg);
      }


      function onData(fn) {
        var listener = java.newProxy('javax.jms.MessageListener', {
          onMessage: function(msg) {
            var r = convert(msg);
            fn(r.type, r.msg);
          }
        });
        _cobj.setMessageListenerSync(listener);
      }

      return ret;
    }


    function Producer(_pobj) {
      var ret = {
        send                : send,
        close               : bind_noarg_fn(_pobj, 'close'),
        getDeliveryDelay    : bind_noarg_fn(_pobj, 'getDeliveryDelay'),
        getDeliveryMode     : bind_noarg_fn(_pobj, 'getDeliveryMode'),
        getDisableMessageID : bind_noarg_fn(_pobj, 'getDisableMessageID'),
        getPriority         : bind_noarg_fn(_pobj, 'getPriority'),
        getTimeToLive       : bind_noarg_fn(_pobj, 'getTimeToLive'),
      };

      //
      // _m_opt -- {
      //   deliveryMode : int, 
      //   priority     : int, 
      //   timeToLive   : int, 
      //   completionListener : Function(err, jmsg);
      // }
      //
      function send(msg, _m_opt) {
        var jmsg;
        if (!_m_opt) _m_opt = nullobj;

        if (msg === undefined) 
          throw Error('msg undefined');

        if (msg === null) {
          jmsg = jsess.createMessageSync();

        } else if (typeof msg === 'string') {
          jmsg = jsess.createTextMessageSync();
          jmsg.setTextSync(msg);

        } else if (msg.constructor === Buffer) {
          jmsg = jsess.createBytesMessageSync();

          for (var i=0, e=msg.length; i<e; ++i) {
            jmsg.writeByteSync( java.newByte(msg[i]) );
          }

        } else {
          jmsg = jsess.createMapMessageSync();
          for (var n in msg) {
            jmsg.setObjectSync(n, msg[n]);
          }
        }

        if (_m_opt.completionListener) {
          var listener = java.newProxy('javax.jms.CompletionListener', {
            onCompletion: function(msg) {
              _m_opt.completionListener(null, msg);
            },
            onException : function(message, exception) {
              _m_opt.completionListener( new Error(exception.toStringSync()) );
            }
          });

          _pobj.sendSync(jmsg, 
            _m_opt.deliveryMode || DeliveryMode.NON_PERSISTENT, 
            _m_opt.priority     || 4, 
            _m_opt.timeToLive   || 0, 
            listener);
        } else {
          _pobj.sendSync(jmsg, 
            _m_opt.deliveryMode || DeliveryMode.NON_PERSISTENT, 
            _m_opt.priority     || 4, 
            _m_opt.timeToLive   || 0);
        }
      }

      return ret;
    }

    return sess;
  }


  return {
    start         : bind_noarg_fn(conn, 'start'),
    stop          : bind_noarg_fn(conn, 'stop'),
    close         : bind_noarg_fn(conn, 'close'),
    createSession : createSession,
    version       : drvimp.version,
    name          : drvimp.name,
  };
}

