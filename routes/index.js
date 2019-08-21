var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var HashMap = require("hashmap");
var log4js = require("log4js");

/* GET home page. */
var clientPool = new HashMap();
var timeOut = 30000;   //300s
var interval = 10000;   //10s
var logger = log4js.getLogger();

router.get('/', function(req, res, next) {
  console.log("success");
  res.render('decode');
});

//Page Server
router.post('/ps',function(req,res){
  var perUuid = uuid.v1();
  var freshID = {perUuid:perUuid,timeOut:timeOut};
  res.send(freshID);     //for each session,send uuid and session timeout
});

//Statistical Server
router.post('/ss',function (req,res) {
  var info = req.body;
  var uuid = info.uuid;
  var time = info.time;
  clientPool.set(uuid,time);
  console.log(clientPool);
  var sign = {sign:"get it"};
  res.send(sign);
});

setInterval(function () {
  var sessionNum = clientPool.size;
  var curTime = (new Date()).valueOf();
  clientPool.forEach(function (value,key) {
    if(curTime-value > interval){
      clientPool.delete(key);
    }
  });
  logger.info("clientPool:",clientPool._data);
  console.log("session number:",sessionNum);
},interval);


log4js.configure({
  replaceConsole: true,
  appenders: {
    cheese: {
      type: 'dateFile',
      filename: 'client pool.log',
      encoding: 'utf-8',
      layout: {
        type: "pattern",
        pattern: '{"data":\'%m\',"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z"}'
      },
      pattern: "-yyyy-MM-dd-hh",
      keepFileExt: true,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    // 设置默认的 categories
    default: {appenders: ['cheese'], level: 'debug'},
  }
});

module.exports = router;
