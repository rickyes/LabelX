/**
 * 设置变量中间件
 * @type {[type]}
 * @author zhoumq
 */
module.exports = function(ctx,next){
  let pkg = require('../package');
  return async (ctx,next) => {
    ctx.state.fxj = {
      title: pkg.name,
      description: pkg.description
    }
    await next();
  }
}
