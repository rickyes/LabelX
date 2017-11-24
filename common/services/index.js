/**
 * service 集合
 * @type {[type]}
 * @author zhoumq
 */
const room = require('./room')
    , user = require('./user');
module.exports = {
  RoomService: room,
  UserService: user
}
