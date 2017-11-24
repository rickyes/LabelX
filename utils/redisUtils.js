/**
 * redis 操作工具
 * @version 0.0.1
 * @author zhoumq
 */
const Redis = require('ioredis')
    , utils = require('./utils')
    , config = require('config-lite')(__dirname).redis;

const ROOMKEY = 'rooms'
    , USERKEY = 'users'
    , CHATKEY = 'chats'
    , USERLOCATIONKEY = 'userLocations';

var client = null;

/**
 * 连接redis服务
 * @return {[type]}
 */
function start(){
  client = new Redis({
    port: config.PORT,
    host: config.HOST,
    family: config.FAMILY,
    password: config.AUTH,
    db: config.DB
  });

  client.on('error',async (err,result) => {
    console.log('连接redis错误',err);
  });
  client.on('connect', async () => {
    console.log('连接redis服务成功');
  });
}



/**
 * 缓存用户信息
 * @param {[type]} params 用户信息
 */
async function addUser(params){
  if(utils.isEmpty(params,params.userId)){
    return console.error(' redis - addUser 参数错误 ');
  }
  await client.hset('users',params.userId,JSON.stringify(params));
}



/**
 * 获取缓存的用户信息
 * @param  {[type]} userId 用户id
 * @return {[type]}        用户信息
 */
async function getUser(userId){
  if(utils.isEmpty(userId)) return console.error(' redis - getUser 参数错误 ');
  let user = await client.hget(USERKEY,userId);
  if(user == null) return null;
  return JSON.parse(user);
};



/**
 * 缓存房间信息
 * @param {[type]} params 房间信息
 */
async function addRoom(params){
  if(utils.isEmpty(params,params.id))
    return console.error(' redis - addRoom 参数错误 ');
  let roomInfo = await client.hget(ROOMKEY,params.id);
  if(roomInfo != null) return;
  await client.hset(ROOMKEY,params.id,JSON.stringify(params));
}


/**
 * 获取缓存的房间信息
 * @param  {[type]} roomId 房间id
 * @return {[type]}        房间信息
 */
async function getRoom(roomId){
  if(utils.isEmpty(roomId)) return console.error(' redis - getRoom 参数错误 ');
  let room = await client.hget(ROOMKEY,roomId);
  if(room == null) return null;
  return JSON.parse(room);
}



/**
 * 修改缓存的房间信息
 * @param  {[type]} params 房间信息
 */
async function updateRoom(params){
  if(utils.isEmpty(params,params.id))
    return console.error(' redis - updateRoom 参数错误 ');
  await client.hset(ROOMKEY,params.id,JSON.stringify(params));
}



/**
 * 删除缓存中的房间信息
 * @param  {[type]} roomId 房间id
 */
async function delRoom(roomId){
  if(utils.isEmpty(roomId)) return console.error(' redis - delRoom 参数错误 ');
  await client.hdel(ROOMKEY,roomId);
}


/**
 * 缓存用户在房间内的位置
 * @param {[type]} params [description]
 */
async function addUserLocation(params){
  if(utils.isEmpty(params,params.userId,params.roomId,params.seatIndex)){
      return console.error(' redis - addUserLocation 参数错误 ');
  }
  let roomUsers = await client.hget(USERLOCATIONKEY,params.roomId);
  if(roomUsers == null){
    // 没人在房间内
    roomUsers = {};
    roomUsers[params.userId] = {
      seatIndex: params.seatIndex
    }
    await client.hset(USERLOCATIONKEY,params.roomId,JSON.stringify(roomUsers));
  }else{
    roomUsers = JSON.parse(roomUsers);
    let isHas = false;
    for (let key of Object.keys(roomUsers)) {
      if(key == params.userId){
        // 该房间已有该用户
        isHas = true;
        break;
      }
    }
    if(!isHas){
      // 当前房间不存在该用户
      roomUsers[params.userId] = {
        seatIndex: params.seatIndex
      }
      await client.hset(USERLOCATIONKEY,params.roomId,JSON.stringify(roomUsers));
    }
  }
}



/**
 * 获取用户缓存在房间内的位置信息
 * @param  {[type]} userId 用户id
 * @param  {[type]} roomId 房间id
 * @return {[type]}        用户位置信息
 */
async function getUserLocation(userId,roomId){
  if(utils.isEmpty(userId,roomId))
    return console.error(' redis - getUserLocation 参数错误 ');
  let userLocation = null;
  let roomUsers = await client.hget(USERLOCATIONKEY,roomId);
  if(roomUsers == null) return;
  roomUsers = JSON.parse(roomUsers);
  for (let user of Object.keys(roomUsers)) {
    if(user == userId){
      userLocation = roomUsers[user].seatIndex;
      break;
    }
  }
  return userLocation;
}


/**
 * 删除该用户在房间内的位置
 * @param  {[type]} userId 用户id
 * @param  {[type]} roomId 房间id
 */
async function delUserLocation(userId,roomId){
  if(utils.isEmpty(userId,roomId))
    return console.error(' redis - delUserLocation 参数错误');
  let roomUsers = await client.hget(USERLOCATIONKEY,roomId);
  if(roomUsers == null) return;
  roomUsers = JSON.parse(roomUsers);
  for (let user of Object.keys(roomUsers)) {
    if(user == userId){
      delete roomUsers[user];
      await client.hset(USERLOCATIONKEY,roomId,JSON.stringify(roomUsers));
      break;
    }
  }
}

/**
 * 删除该房间内所有的用户位置
 * @param  {[type]} roomId 房间id
 */
async function delAllUserLocation(roomId){
  if(utils.isEmpty(roomId))
    return console.error(' redis - delAllUserLocation 参数错误');
  let roomUsers = await client.hget(USERLOCATIONKEY,roomId);
  if(roomUsers == null) return;
  await client.hdel(USERLOCATIONKEY,roomId);
}


/**
 * 更新用户在房间内的位置
 * @param  {[type]} params 用户位置信息
 */
async function updateUserLocation(params){
  if(utils.isEmpty(params,params.userId,params.roomId,params.seatIndex)){
    return console.error('redis - updateUserLocation 参数错误');
  }
  let roomUsers = await client.hget(USERLOCATIONKEY,params.roomId);
  if(roomUsers == null) return;
  roomUsers = JSON.parse(roomUsers);
  for (let user of Object.keys(roomUsers)) {
    if(user == params.userId){
      roomUsers[user].seatIndex = params.seatIndex;
      await client.hset(USERLOCATIONKEY,params.roomId,JSON.stringify(roomUsers));
      break;
    }
  }
}



/**
 * 缓存聊天记录
 * @param {[type]}  userId       用户id
 * @param {[type]}  roomId       房间id
 * @param {[type]}  msg          聊天内容
 * @param {Boolean} [look=false] 是否是表情
 */
async function addChatMsg(userId,roomId,msg,look = false){
  if(utils.isEmpty(userId,roomId,msg,look)){
    return console.error(' redis - addChatMsg 参数错误');
  }
  let chatInfo = await client.hget(CHATKEY,roomId);
  let name = await getUser(userId).dataValues.name;
  if(chatInfo == null){
    let msg = [];
    msg.push({
      name: name,
      content: msg,
      look: look
    });
  }else{
    chatInfo = JSON.parse(chatInfo);
    chatInfo.msg.push({
      name: name,
      content: msg,
      look: look
    });
  }
  await client.hset(CHATKEY,roomId,JSON.stringify(chatInfo));
}


/**
 * 获取该房间的聊天记录
 * @param  {[type]} roomId 房间id
 * @return {[type]}        该房间的聊天记录
 */
async function getChatMsg(roomId){
  if(utils.isEmpty(roomId)) return console.error(' redis - getChatMsg 参数错误');
  return await client.hget(CHATKEY,roomId);
}


/**
 * 删除聊天记录
 * @param  {[type]} roomId 房间号
 */
async function delChatMsg(roomId){
  if(utils.isEmpty(roomId)) return console.error(' redis - delChatMsg 参数错误');
  return await client.hdel(CHATKEY,roomId);
}

module.exports = {
  start,
  addUser,
  getUser,
  addRoom,
  getRoom,
  updateRoom,
  delRoom,
  addUserLocation,
  getUserLocation,
  delUserLocation,
  delAllUserLocation,
  updateUserLocation,
  addChatMsg,
  getChatMsg,
  delChatMsg
}
