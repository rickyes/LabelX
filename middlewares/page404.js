/**
 * 404page中间件
 * @type {[type]}
 * @author zhoumq
 */
module.exports = function(ctx,next){
  return async (ctx,next) => {
    if (ctx.status === 404) {
      await ctx.render('404');
    }
    await next();
  }
}
