/**
 * @version 0.0.1
 * @author zhoumq
 */
const Koa = require('koa')
    , app = new Koa()
    , middlewares = require('./middlewares/index')
    , bodyParser = require('koa-bodyparser')
    , config = require('config-lite')(__dirname).app
    , socketConfig = require('config-lite')(__dirname).socket
    , routes = require('./routes/index')
    , statics = require('koa-static')
    , path = require('path')
    , views = require('koa-views')
    , redis = require('./utils/redisUtils')
    , socketServer = require('./common/servers/socket/socket');

/**
 * 设置中间件集合
 */
app
  .use(middlewares.controll())
  .use(middlewares.log())
  .use(middlewares.error())
  .use(middlewares.cors())
  .use(bodyParser())
  .use(statics(path.join(__dirname,'public')))
  .use(views(path.join(__dirname, 'views'), {extension: 'ejs'}))
  .use(middlewares.state())
  .use(middlewares.page404())

/**
 * 绑定路由集合
 */
routes.bind(app);


/**
 * 连接Redis服务
 */
redis.start();

/**
 * 开启socket服务
 */
socketServer.start(socketConfig);

if(module.parent){
  module.exports = app;
}else{
  app.listen(config.PORT,() => {
    console.log(`LabelX HTTP Server start port ${config.PORT}...`);
  });
}
