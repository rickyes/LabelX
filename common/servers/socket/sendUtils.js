/**
 * socket 响应客户端工具集合
 * @param  {[type]}
 * @author zhoumq
 */
const Redis = require('../../../utils/redisUtils')
    , RoomRedis = require('../redis/room')
    , userMgr = require('./usermgr')
    , utils = require('../../../utils/utils');


/**
 * 发送给客户端
 * @param {用户id} userId 
 * @param {房间id} roomId 
 * @param {事件名称} event 
 * @param {发送数据} data 
 */
exports.sendMsg = async function (userId, roomId, event, data) {
    var userInfo = userMgr.getSocket(userId, roomId);
    if (userInfo == null) {
        return;
    }
    var socket = userInfo;
    if (socket == null) {
        return;
    }
    socket.emit(event, data);
};

/**
 * 广播房间内的所有用户
 * @param {事件名称} event 
 * @param {发送数据} data 
 * @param {发起响应事件的用户id} sender 
 * @param {房间id} roomId 
 * @param {是否发送给自己，true为发送给自己} includingSender 
 */
exports.broacastInRoomAll = async function (event, data, sender, roomId, includingSender) {
    if (roomId == null) {
        return;
    }
    var roomInfo = await Redis.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }
    for (var i = 0; i < roomInfo.users.length; ++i) {
        var userId = roomInfo.users[i];

        //如果不需要发给发送方，则跳过
        if (userId == sender && includingSender != true) {
            continue;
        }
        var socket = userMgr.getSocket(userId, roomId);
        if (socket != null) {
            socket.emit(event, data);
        }
    }
}


/**
 * 广播房间内的旁观者
 * @param {事件名称} event 
 * @param {发送数据} data 
 * @param {发起响应事件的用户id} sender 
 * @param {房间id} roomId 
 */
exports.broacastNoSitInRoom = async function (event, data, sender, roomId) {
    if (roomId === null) return;
    let roomInfo = await Redis.getRoom(roomId);
    if (roomInfo === null) return;
    let sitUsers = await RoomRedis.getSitUsersOfRoom(roomId);
    let noSitUsers = utils.filterAToB(roomInfo.users, sitUsers);
    for (var i = 0; i < noSitUsers.length; ++i) {
        var userId = noSitUsers[i];
        var socket = userMgr.getSocket(userId, roomId);
        socket.emit(event, data);
    }
}

/**
 * 广播房间内坐下的用户
 * @param {事件名称} event 
 * @param {发送数据} data 
 * @param {发起响应事件的用户id} sender 
 * @param {房间id} roomId 
 * @param {是否发送给自己} includingSender 
 */
exports.broacastInRoom = async function (event, data, sender, roomId, includingSender) {
    if (roomId == null) {
        return;
    }
    var roomInfo = await Redis.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }

    for (var i = 0; i < roomInfo.seats.length; ++i) {
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if (rs.userId == sender && includingSender != true) {
            continue;
        }
        var socket = userMgr.getSocket(rs.userId, roomId);
        if (socket != null) {
            socket.emit(event, data);
        }
    }
};
