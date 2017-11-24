/**
 * room路由集合
 * @type {[type]}
 * @author zhoumq
 * @company Flym
 */
const Router = require('koa-router')
    , RoomController = require('../common/controllers/room');

let room = new Router();
room.post('/create',RoomController.create);
room.post('/info',RoomController.info);

module.exports = room;
