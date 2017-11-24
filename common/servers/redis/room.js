/**
 * redis 房间控制器集合
 * @param  {[type]}
 * @author zhoumq
 */
const Redis = require('../../../utils/redisUtils')
    , utils = require('../../../utils/utils');

/**
 * 创建房间
 * @param {*房间参数} params 
 */
exports.createRoom = async function (params) {
    var roomInfo = params;
    await Redis.addRoom(roomInfo);
}

/**
 * 玩家进入房间
 * @param {玩家参数} params 
 */
exports.enterRoom = async function(params){
    let userId = params.userId;
    let roomId = params.roomId;
    let room = await Redis.getRoom(roomId);
    if(room == null) return null;
    room.users.push(userId);
    await Redis.updateRoom(room);
    await Redis.addUserLocation(params);
}

/**
 * 获取房间内已坐下的用户id数组
 * @param {用户id} userId 
 * @param {房间id} roomId 
 */
exports.getSitUsersOfRoom = async function(roomId){
    let room = await Redis.getRoom(roomId);
    if(room == null) return null;
	let users = [];
	for(let i=0;i<4;i++){
		if(room.seats[i].userId > 0) users.push(room.seats[i].userId);
	}
	return users;
}


/**
 * 获取房间内旁观者id数组
 * @param {房间id} roomId 
 */
exports.getNoSitUsersOfRoom = async function(roomId){
	let room = await Redis.getRoom(roomId);
	if(room == null) return;
	let sitUsers = await exports.getSitUsersOfRoom(roomId);
	return utils.filterAToB(room.users,sitUsers)
}


/**
 * 获取房间内所有的用户id
 * @param {房间id} roomId 
 */
exports.getAllUsersOfRoom = async function(roomId){
    let room = await Redis.getRoom(roomId);
	if(room == null) return;
	return room.users;
}

/**
 * 玩家退出房间删除房间内的用户
 * @param {用户id} userId 
 * @param {房间id} roomId 
 */
exports.delUserOfRoom = async function(userId,roomId){
    var room = await Redis.getRoom(roomId);
	if(room == null){
		return;
    }
    let index = room.users.indexOf(userId);
    if(index >= 0){
        room.users.splice(index,1);
    }
    await Redis.updateRoom(room);
    await Redis.delUserLocation(userId,roomId);
}


/**
 * 销毁房间
 * @param {房间id} roomId 
 */
exports.destroy = async function(roomId){
	var roomInfo = await Redis.getRoom(roomId);
	if(roomInfo == null){
		return;
	}
    var userId = 0;
    await Redis.delRoom(roomId);
    await Redis.delAllUserLocation(roomId);
}