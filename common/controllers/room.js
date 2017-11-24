/**
 * room 控制器集合
 * @type {Object}
 * @author zhoumq
 */

const { RoomService } = require('../services/index')
  , cryptoUtils = require('../../utils/cryptoUtils')
  , utils = require('../../utils/utils')
  , superagent = require('superagent')
  , config = require('config-lite')(__dirname)
  , Redis = require('../../utils/redisUtils')
  , RoomRedis = require('../servers/redis/room');


/**
 * 建立房间
 * @param  {[type]}   ctx
 * @param  {Function} next
 * @return {[type]}
 */
async function create(ctx,next){
  let req = ctx.request;
  utils.send(ctx,0,'建立房间成功',req.body);
}



/**
 * 房间信息
 * @param  {[type]}   ctx
 * @param  {Function} next
 */
async function info(ctx,next){
  let req = ctx.request;
  utils.send(ctx,0,'获取房间信息成功',req.body);
}


module.exports = {
  create,
  info
}
