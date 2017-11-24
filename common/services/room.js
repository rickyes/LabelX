/**
 * room services接口集合
 * @type {Object}
 * @author zhoumq
 */
const {
   UserModel,
  RoomModel,
  RoomConfigModel,
  RoomUserModel,
  ChargGemsModel,
  RoomGameAllRecordModel
 } = require('../../utils/dbUtils');
const utils = require('../../utils/utils')
  , Redis = require('../../utils/redisUtils');



/**
 * 建立房间
 * @param  {[type]} params 房间配置参数
 * @return {[type]}        obj
 */
async function create(params) {
  let data = await RoomConfigModel.create(params);
  if (data == null) return null;
  let room = await RoomModel.create({
    config_id: data.id,
    room_create_user_id: params.user_id,
    room_name: params.room_name,
    zj_type: params.zj_type
  });
  if (room == null) return null;
  return { room: room, conf: data };
}



/**
 * 获取房间信息genrator函数
 * @param  {[type]} params configid、roomid
 * @return {[type]}        {room,room_users}
 */
var infoSync = async function (params) {
  let room_config = await RoomConfigModel.findOne({
    where: { id: params.configid },
    attributes: ['bottom_score', 'fan', 'create_time', 'laizi', 'piece', 'type']
  });
  let room_users_info = await RoomUserModel.findAll({
    where: { room_id: params.roomid },
    attributes: ['user_id']
  });
  let resp_room_users = [];
  let user_info = '';
  let create_date = utils.formatToChinese(room_config.create_time);
  room_config.dataValues.create_time = create_date;
  for (let i = 0; i < room_users_info.length; i++) {
    if (room_users_info[i].user_id == params.userid) {
      continue;
    }
    user_info = await Redis.getUser(room_users_info[i].user_id);
    if (user_info == null) continue;
    resp_room_users.push({
      userName: user_info.userName,
      userLogo: user_info.userLogo,
      ticketsNum: user_info.ticketsNum
    });
  }
  return { room: room_config, room_users: resp_room_users };
}



/**
 * 获取房间信息
 * @param  {[type]} params 房间参数
 * @return {[object]} info 房间信息及在房间内的人
 */
async function info(params) {
  let data = await RoomModel.findOne({
    where: { id: params.roomid },
    attributes: ['id', 'room_create_user_id', 'config_id', 'room_name']
  });
  if (data == null) return null;
  let result = await infoSync({ roomid: params.roomid, configid: data.config_id, userid: data.room_create_user_id });
  let info = {};
  let createrUser = await Redis.getUser(data.room_create_user_id);
  info.room_users = result.room_users;
  info.createrUser = {
    userName: createrUser.userName,
    userLogo: createrUser.userLogo,
    ticketsNum: createrUser.ticketsNum
  };
  Object.assign(info, result.room.dataValues, data.dataValues);
  return info;
}

/**
 * 获取房间内玩家列表
 * @param  {[type]} params 房间参数
 * @return {[object]} users 房间内的玩家
 */
async function users(params) {
  let data = await RoomModel.findOne({
    where: { id: params.roomid },
    attributes: ['id', 'room_create_user_id', 'config_id', 'room_name']
  });
  if (data == null) return null;
  let result = await infoSync({ roomid: params.roomid, configid: data.config_id, userid: data.room_create_user_id });
  return result.room_users;
}


/**
 * 查看房间是否正在进行
 * @param  {[type]}  params 房间参数
 * @return {Boolean}       是否有该房间并且没有结束
 */
async function hasRoom(params) {
  let id = await RoomModel.findOne({
    where: { id: params.roomid, is_end: 0 },
    attributes: ['id']
  });
  return id == null ? false : true;
}



/**
 * 查看房间创建者
 * @param  {[type]} params 房间参数
 * @return {[type]}        是否是该房间的创建者
 */
async function roomCreateUser(params) {
  let size = await RoomModel.count({
    where: { id: params.roomid, room_create_user_id: params.userid }
  });
  if (size == 0) return false;
  return true;
}



/**
 * 进入房间
 * @param  {[type]} params 角色、userid,roomid,seat
 * @return {[type]}        [description]
 */
async function enter(params) {
  let room = {};
  let result = {};
  let roomUserNumber = await RoomUserModel.findOne({
    where: {
      room_id: params.roomid,
      user_id: params.userid
    },
    attributes: ['is_room']
  });
  if(roomUserNumber != null && roomUserNumber.is_room == 2){
    result = await RoomUserModel.update({
      is_room: 1
    },{
      where: {
        room_id: params.roomid,
        user_id: params.userid
      }
    });
  }else{
    result = await RoomUserModel.create({
      room_id: params.roomid,
      user_id: params.userid,
      role: params.role,
      seat: params.seat
    });
    if (result == null) return null;
  }
  return result;
}



/**
 * 坐下
 * @param  {[type]} params 用户参数
 * @return {[type]}        [description]
 */
async function sitdown(params) {
  return await RoomUserModel.update({
    'sit_down': 1,
    'deduct': 1,
    'role': params.role,
    'seat': params.seat
  }, {
      where: {
        'user_id': params.userid,
        'room_id': params.roomid
      }
    });
}



/**
 * 检查坐下是否需要扣费
 * @param  {[type]}  params 扣费参数
 * @return {Boolean}        [description]
 */
async function hasCharg(params) {
  let type = await RoomModel.findOne({
    where: { id: params.roomid },
    attributes: ['zj_type']
  });
  if (type == null) throw new Error('没有该房间');
  if (type.zj_type === 'fz') return false;
  if (type.zj_type === 'aa') {
    let user = await RoomUserModel.findOne({
      where: { user_id: params.userid, room_id: params.roomid }
    });
    if (user === null) return null;
    if (user.deduct === 0) return true;
    return false;
  }
}



/**
 * 房主模式扣房卡
 * @param  {[type]} params 房主扣费参数
 * @return {[type]}        [description]
 */
// async function charg(params){
//   var gems = 0;
//   let result = await UserModel.findOne({
//     where: { userid: params.userid },
//     attributes: ['gems']
//   });
//   if(result == null) return null;
//   if(result.dataValues.gems < 4) return '账户门票不足';
//   gems = result.dataValues.gems;
//   let info = await ChargGemsModel.create(params);
//   if(info == null) return null;
//   return await UserModel.update({
//     "gems": gems-4
//   },{
//     where: {
//       "userid": params.userid
//     }
//   });
// }



/**
 * 查看用户有没有进入房间
 * @param  {[type]}  params userid、roomid
 * @return {Boolean}        false/true
 */
async function isRoom(params) {
  let result = await RoomUserModel.findOne({
    where: {
      user_id: params.userid,
      room_id: params.roomid
    },
    attributes: ['room_id']
  });
  return (result == null) ? false : true;
}



/**
 * 更新在房间的状态
 * @param  {[type]} params userid、roomid
 * @return {[type]}        {errcode,errmsg}
 */
async function sitdownNoGems(params) {
  let room_user_id = 0;
  let roomUserInfo = await RoomUserModel.findOne({
    where: {
      user_id: params.userid,
      room_id: params.roomid
    },
    attributes: ['sit_down','id']
  });
  if (roomUserInfo == null) return { errcode: 1, errmsg: '还没进入房间',datas: {room_user_id: room_user_id} };
  room_user_id = roomUserInfo.dataValues.id;
  if (roomUserInfo.dataValues.sit_down === 1) return { errcode: 0, errmsg: '已经坐下',datas: {room_user_id: room_user_id} };
  else if (roomUserInfo.dataValues.sit_down === 0) {
    let updateInfo = await RoomUserModel.update({
      "sit_down": 1,
      "role": '参与者'
    }, {
        where: {
          'user_id': params.userid,
          'room_id': params.roomid
        }
      });
    if (updateInfo == null) return { errcode: 3, errmsg: '坐下失败',datas: {room_user_id: room_user_id} };
    return { errcode: 0, errmsg: '坐下成功',datas: {room_user_id: room_user_id} };
  }
}



/**
 * 根据房间id和用户id查询房间用户表信息
 * @param  {[type]} params userid、roomid
 * @return {[type]}        obj
 */
async function findRoomUser(params) {
  return await RoomUserModel.findOne({
    where: {
      user_id: params.userid,
      room_id: params.roomid
    },
    attributes: ['room_id']
  })
}



/**
 * 游戏结束房间关闭游戏结果存档
 * @param  {[type]} params roomid
 * @return {[type]}        [description]
 */
async function saveGameResult(params) {
  try {
    let result = await RoomModel.update({
      is_end: 1
    }, {
        where: {
          id: params.roomid
        }
      });
    if (result == null) return new Error('结束房间错误');
    return await RoomGameAllRecordModel.create(params);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return '已经有该条游戏记录';
    return err;
  }
}



/**
 * 玩家列表
 * @param  {[type]} params roomid
 * @return {[type]}        array
 */
async function userList(params) {
  return await RoomUserModel.findAll({
    where: {
      room_id: params.roomid,
      is_room: 1
    }
  });
}



/**
 * 起身
 * @param  {[type]} params userid、roomid
 * @return {[type]}        obj
 */
async function standup(params) {
  return await RoomUserModel.update({
    sit_down: 0,
    role: '旁观者'
  }, {
      where: {
        room_id: params.roomid,
        user_id: params.userid
      }
    });
}



/**
 * 离开
 * @param  {[type]} params userid、roomid
 * @return {[type]}        obj
 */
async function leave(params) {
  return await RoomUserModel.update({
    is_room: 2,
    sit_down: 0
  }, {
      where: {
        room_id: params.roomid,
        user_id: params.userid
      }
    });
}


/**
 * 查找玩家还在进行中的房间
 * @param  {[type]} params userid、roomid
 * @return {[type]}        obj
 */
async function findRoomByUser(params) {
  let userRooms = await RoomUserModel.findAll({
    where: {
      user_id: params.userid
    },
    attributes: ['room_id']
  });
  let has = false;
  for (let i = userRooms.length -1 ; i > 0; i--) {
    has = await hasRoom({ roomid: userRooms[i].room_id, is_end: 0 });
    if (has) return userRooms[i].room_id;
  }
  return null;
}

/**
 * 更新玩家房间表的扣费状态
 * @param {玩家参数} params 
 */
async function updateRoomUserDeduct(params){
  return await RoomUserModel.update({
    deduct: 1
  },{
    where: {
      user_id: params.userId,
      room_id: params.roomId
    }
  });
}

module.exports = {
  create,
  leave,
  info,
  hasRoom,
  roomCreateUser,
  standup,
  userList,
  saveGameResult,
  findRoomUser,
  sitdownNoGems,
  isRoom,
  // charg,
  hasCharg,
  sitdown,
  enter,
  users,
  findRoomByUser,
  updateRoomUserDeduct
}
