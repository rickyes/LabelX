/**
 * user路由集合
 * @type {[type]}
 * @author zhoumq
 */
const Router = require('koa-router')
    , UserController = require('../common/controllers/user');

let user = new Router();
user.post('/create',UserController.createUser);
user.post('/info',UserController.getUserInfo);

module.exports = user;
