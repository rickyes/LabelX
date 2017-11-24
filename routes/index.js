/**
 * 设置路由集合
 * @param  {[type]} app Koa 对象
 * @author zhoumq
 */
exports.bind = function(app){
    const Router = require('koa-router')
        , room = require('./room')
        , user = require('./user');

    let root = new Router();
    root.get('/',async (ctx) => {
        await ctx.render('index');
    });
    root.use('/room',room.routes(),room.allowedMethods());
    root.use('/user',user.routes(),user.allowedMethods());

    app.use(root.routes()).use(root.allowedMethods());
}
