var Events = require("events").EventEmitter;


module.exports = {
  open : open
};


var driver_list = {
  OpenMQ        : './driver/openmq.js',
  ActiveMQ      : './driver/activemq.js',
  HornetQ       : './driver/hornetq.js',
  ibmMQ         : './driver/websphere.js',
  WebLogic      : './driver/weblogic.js',
};


//
// 打开到 MQ 的连接
//
// option -- {
//   driver : 'OpenMQ'
//   host   : 'localhost',  -- jms 服务器地址
//   port   : '8888',       -- 服务器端口
//   user   : 'admin',      -- 登录用户名
//   pass   : 'admin', 　   -- 登录密码
// }
//
// return {
//   version -- 底层驱动的版本号 (jar 项目的版本号)
//   name    -- 底层驱动的完整名称
// }
//
function open(option) {
  var drvjs = driver_list[option.driver];
  if (!drvjs) {
    throw new Error('unknow driver:' + option.driver);
  }

  var event   = new Events();
  var comm    = require('./common.js');
  var drv     = require(drvjs);
  var drvimp  = drv.open(option, event);

  return comm.open(option, drvimp, event);
}