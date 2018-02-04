/**
 * 控制并发koa上下文链中间件
 * @type {[type]}
 * @author zhoumq
 */
const Lock = require('lockx');
const lockName = 'lock:room/enter';

module.exports = function() {
  return async (ctx, next) => {
    ctx.state.lock = {
      Lock,
      lockName
    };
    if (Lock.waitings.length == 0) {
      await next();
    } else {
      if (Lock.waitings.length == 0) {
        await next();
      } else {
        ctx.body = {
          code: 100000,
          message: '系统忙碌',
          datss: {}
        };
      }
    }
  }
}
