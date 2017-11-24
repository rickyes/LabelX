/**
 * socket工具函数集合
 * @param  {[type]}
 * @author zhoumq
 */
var userMgr = require('./usermgr')
    , Redis = require('../../../utils/redisUtils')
    , RoomRedis = require('../redis/room')
    , sendUtils = require('./sendUtils')
    , utils = require('../../../utils/utils');

/**
 * 通知客户端房间信息
 * @param  {[type]}  userid            用户id
 * @param  {[type]}  roomid            房间id
 * @param  {[type]}  socket            socket实例
 * @param  {[type]}  emitEvent         事件名称
 * @param  {Boolean} [reconn=false]    是否重连
 * @param  {Boolean} [isStandup=false] 是否站起
 * @return {[type]}                    userData
 */
exports.sendRoomInfo = async function (userid, roomid, socket, emitEvent, reconn = false) {
    let roomInfo = await Redis.getRoom(roomid);
    let userData = {};
    var seats = [];
    for (var i = 0; i < roomInfo.seats.length; ++i) {
        var rs = roomInfo.seats[i];
        var online = false;
        if (rs.userId > 0) {
            online = userMgr.isOnline(rs.userId, roomid);
        }

        seats.push({
            userId: rs.userId,
            score: rs.score,
            userName: rs.userName,
            online: online,
            ready: rs.ready,
            seatIndex: rs.seatIndex,
            userLogo: rs.userLogo
        });
    }

    let ret = utils.sendTemp(0, message, {
        conf: {
            roomName: roomInfo.conf.roomName,
            type: roomInfo.conf.type,
            baseScore: roomInfo.conf.baseScore,
            piece: roomInfo.conf.maxGames,
            numOfGame: roomInfo.numOfGames
        },
        seats: seats
    });
    await sendUtils.broacastInRoomAll(emitEvent, ret, userid, roomid, true);
}

/**
 * 通知客户端玩家起身
 * @param {用户id} userId 
 * @param {房间id} roomId 
 */
exports.sendStandup = async function (userId, roomId, userSeat) {
    let seat = {
        userId: userSeat.userId,
        score: userSeat.score,
        userName: userSeat.userName,
        online: userSeat.online,
        ready: userSeat.ready,
        seatIndex: userSeat.seatIndex,
        userLogo: userSeat.userLogo
    }
    await sendUtils.broacastInRoomAll('standupResult', utils.sendTemp(0, '玩家起身成功', seat), userId, roomId, true);
}

/**
 * 用户列表
 * @param  {[type]} data
 */
exports.userList = async function (socket, data) {
    let roomid = data.roomid;
    let userid = data.userid;
    if (roomid == null || userid === null) return;
    let room = await Redis.getRoom(roomid);
    if (room == null) return;
    let situsers = [];
    let seat = null;
    let nositusers = [];
    for (let i = 0; i < room.seats.length; i++) {
        seat = room.seats[i];
        if (seat.userId > 0) {
            situsers.push({ userId: seat.userId, userName: seat.userName, score: seat.score, userLogo: seat.userLogo });
        }
    }
    let noSits = [];
    noSits = await RoomRedis.getNoSitUsersOfRoom(roomid);
    for (let i = 0; i < noSits.length; i++) {
        let nosituser = await Redis.getUser(noSits[i], roomid);
        if (nosituser !== null && nosituser !== undefined) {
            nositusers.push({
                userId: nosituser.userId,
                userName: nosituser.userName,
                score: 0,
                userLogo: nosituser.userLogo
            });
        } else continue;
    };
    let creator = await Redis.getUser(room.conf.creator);
    let enterUser = await Redis.getUser(userid);
    let resp_data = {
        conf: {
            name: creator.userName,
            baseScore: room.conf.baseScore,
            numOfGames: room.numOfGames,
            maxOfGames: room.conf.maxGames,
            users: noSits.length
        },
        sitUsers: situsers,
        noSitUsers: nositusers
    };
    await sendUtils.broacastInRoomAll('userListPush', utils.sendTemp(0, '获取玩家列表成功', resp_data), userid, roomid, true);
}



/**
 * 出牌
 * @param  {[type]} data
 */
exports.chuPai = function (socket, data) {
    if (socket.userId == null || socket.roomId == null) {
        return;
    }
    var pai = data;
    socket.gameMgr.chuPai(socket.userId, socket.roomId, pai);
}


/**
 * 过
 * @param  {[type]} data
 */
exports.guo = function (socket) {
    if (socket.userId == null || socket.roomId == null) {
        return;
    }
    socket.gameMgr.guo(socket.userId, socket.roomId);
}


/**
 * 解散房间
 * @param  {[type]} userId 用户id
 * @param  {[type]} roomId 房间id
 */
exports.dispress = async function (userId, roomId) {
    if (userId == null || roomId == null) {
        return;
    }
    await sendUtils.broacastInRoomAll('dissolvePush', utils.sendTemp(0, '房间已解散'), userId, roomId, true);
    await userMgr.kickAllInRoom(roomId);
    await RoomRedis.destroy(roomId);
}