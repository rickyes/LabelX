/**
 * 日记中间件
 * @type {[type]}
 * @author zhoumq
 * @company Flym
 */
const log4js = require('log4js')
    , logConfig = require('config-lite')(__dirname).log;

/**
 * 配置日记记录
 * @type {String}
 */
log4js.configure(logConfig);

let logUtil = {};

let errorLogger = log4js.getLogger('error')
  , resLogger = log4js.getLogger('response');


/**
 * 封装错误日志
 * @param  {[type]} ctx
 * @param  {[type]} error
 * @param  {[type]} resTime
 */
logUtil.error = function (error) {
    if (error) {
        errorLogger.error(error);
    }
};


/**
 * 封装响应日志
 * @param  {[type]} ctx
 * @param  {[type]} resTime
 */
logUtil.res = function (info) {
    if (info) {
        resLogger.info(info);
    }
};

module.exports = function(){
  return async (ctx,next) => {
    ctx.log = logUtil;
    global.log = logUtil;
    let ip = ctx.request.ip.indexOf('::ffff:')!==-1
           ? ctx.request.ip.substr(7)
           : ctx.request.ip;
    ip = ip.indexOf('::1') !== -1
       ? '127.0.0.1'
       : ip;
    ctx.log.res(`${ip} ${ctx.request.method} ${ctx.request.originalUrl}`);
    await next();
  }
}
