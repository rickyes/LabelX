'use strict';
/**
 * 工具集合
 * @version 0.0.1
 * @author zhoumq
 */
const utils = require('util')
    , _ = require('./lodash')
    , config = require('config-lite')(__dirname);

/**
 * a - a && b
 * @param  {[type]} a [1,2,3,4]
 * @param  {[type]} b [2,3]
 * @return {[type]}   [1,4]
 */
function filterAToB(a,b){
  let c = _.cloneDeep(a);
  let index = -1;
  for(let i=0;i<b.length;i++){
    index = c.indexOf(b[i]);
    if(index > -1) c.splice(index,1);
  }
  return c;
}

/**
 * 对象深拷贝(obj !== a)
 * @param  {[type]} obj 对象
 * @return {[type]}     同值不同引用的对象
 */
function cloneDeep(obj){
  let a = _.cloneDeep(obj);
  return a;
}

/**
 * 判断对象是否为初始值
 * @param  {[type]} obj 对象
 * @return {[type]}     是否为初始值
 */
function isEmpty(){
  for (let obj of arguments) {
    if(obj === null || obj === '' || obj === undefined){
      return true;
    }
  }
  return false;
}

/**
 * http响应客户端数据工具函数
 * @param  {[type]} ctx     koa 上下文
 * @param  {[type]} errcode 响应码
 * @param  {[type]} errmsg  响应信息
 * @param  {[type]} data    响应内容
 */
function send(ctx,errcode,errmsg,data){
  let res = {};
	if(data == null){
		data = {};
	}
  res.datas = data;
	res.result = errcode;
  res.message = errmsg;
  ctx.log.res(res);
  console.log(res);
	ctx.body = res;
};

/**
 * 日期格式化中文
 * @param  {[type]} date 日期
 * @return {[type]}      xx月xx日xx时xx分
 */
function formatToChinese(date){
  let time = new Date(date);
  time = (time.getMonth()+1)
      +'月'+time.getDate()+'日 '+time.getHours()+'时'+time.getMinutes()+'分';
  return time;
}


/**
 * 构造响应客户端参数
 * @param  {[type]} errcode 响应码
 * @param  {[type]} errmsg  响应消息
 * @param  {[type]} data    响应数据
 * @return {[type]}         发送给客户端的数据
 */
function sendTemp(errcode,errmsg,data){
  let res = {};
  if(data == null){
    data = {};
  }
  res.result = errcode;
  res.message = errmsg;
  res.datas = data;
  return res;
}


/**
 * 将 callback 转换成 promise
 * 约定: callback 模式下 回调参数只能有2个参数 第一个为err 第二个为实际对象
 * sum: 求和函数
 * sum(1, 2, 3, function(err, data){ console.log(data) }) => 6
 * promisify(sum, 1, 2, 3).then(function(data){ console.log(data) }) => 6
 * @return {Promise}
 */
function promisify(){
  const fn = arguments[0];
  const args = _.toArray(arguments).slice(1);
  return new Promise((resolve,reject) => {
    function callback(err,data){
      if(err){
        return reject(err);
      }
      return resolve(data);
    }

    args.push(callback);

    fn.apply(null,args);
  });
}

/**
 * 签名函数
 * @param  {[type]} params 需要签名的参数
 * @return {[type]}        签名串
 */
function sign(params){
  let signStr = '';
  for (let key of Object.keys(params).sort()) {
    signStr += `${key}=${params[key]}`;
  }
  signStr = `${signStr}${config.app_secret}`;
  return signStr;
}


/**
 * 生成判断参数类型函数
 * eg:
 * var isString = isType('String');
 * var str = 'hello world';
 * console.log(isString(str)) // true
 * @param {类型字符串} type 
 */
function isType(type){
  return function(obj){
    return Object.prototype.toString.call(obj) == `[object ${type}]`;
  }
}

module.exports = {
  filterAToB,
  cloneDeep,
  isEmpty,
  send,
  formatToChinese,
  sendTemp,
  promisify,
  sign,
  isType
}
