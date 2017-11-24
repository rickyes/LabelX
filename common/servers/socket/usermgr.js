var utils = require('../../../utils/utils')
  , Redis = require('../../../utils/redisUtils');

// 绑定在线用户和所持有的socket句柄
exports.bind = function(userId,roomId,socket){
    let isHas = false;
    for(let i=0;i<userList.length;i++){
      if(userList[i].userId == userId && userList[i].roomId == roomId){
        userList[i].socket = socket;
        isHas = true;
        break;
      }
    }
    if(!isHas){
      userList.push({
        userId: userId,
        roomId: roomId,
        socket: socket
      });
    }
};

// 删除内存列表中该用户的socket连接
exports.del = function(userId,roomId){
    for(let i=0;i<userList.length;i++){
      if(userList[i].userId == userId && userList[i].roomId == roomId){
        userList.splice(i,1);
      }
    }
    if(roomId == null) return;
};

// 获取该用户的socket句柄
exports.get = function(userId,roomId){
    return exports.getSocket(userId,roomId);
};

// 判断该用户是否在线
exports.isOnline = function(userId,roomId){
    return exports.getSocket(userId,roomId) ? true : false;
};

// 获取所有的在线用户
exports.getOnline = function(){
    return userList;
}

// 获取userId 和 roomId 绑定的socket
exports.getSocket = function(userId,roomId){
  for(let i=0;i<userList.length;i++){
    if(userList[i].userId == userId && userList[i].roomId == roomId){
      return userList[i].socket;
    }
  }
  return null;
}

/**
 * 断掉该房间所有用户的socket连接
 * @param {房间id} roomId
 */
exports.kickAllInRoom = async function(roomId){
    if(roomId == null){
        return;
    }
    var roomInfo = await Redis.getRoom(roomId);
    if(roomInfo == null){
        return;
    }
    for(var i = 0; i < roomInfo.users.length; ++i){
        if(roomInfo.users[i] > 0){
            var socket = exports.getSocket(roomInfo.users[i],roomId);
            if(socket != null){
                exports.del(roomInfo.users[i],roomId);
                socket.disconnect();
            }
        }
    }
};
