/**
 * socket 事件集合
 * @param  {[type]}
 * @author zhoumq
 */
var EventEmitter = require('events').EventEmitter;
var start = function (config) {
	var utils = require('../../../utils/utils')
		, userMgr = require('./usermgr')
		, Redis = require('../../../utils/redisUtils')
		, socketUtils = require('./socketUtils')
		, sendUtils = require('./sendUtils');
	var io = null;

	var events = null;

	io = require('socket.io')(config.PORT);

	io.sockets.on('connection', function (socket) {

		// 每个客户端持有一个EventEmitter
		events = new EventEmitter();

		/**
		 * socket初始化事件
		 * @param  {[type]} data
		 */
		socket.on('login', async function (data) {

		});


		/**
		 * 用户列表
		 * @param  {[type]} data
		 */
		socket.on('userList', async function (data) {
			await socketUtils.userList(socket, data);
		});


		/**
		 * 用户列表
		 * @param  {[type]} data
		 */
		events.on('userList', async function (data) {
			await socketUtils.userList(socket, data);
		});


		/**
		 * 倒计时30秒，未操作两次后则进入托管，时间为2秒
		 * @param  {[type]} pai
		 */
		events.on('timing', function (data) {
			if (socket.timeNumber !== undefined && socket.timeNumber === 2) socket.tuoguang = true;
			else socket.tuoguang = false;
			let second = 30 * 1000;
			if (socket.tuoguang) second = 2 * 1000;
			let timeout = setTimeout(function () {
				socketUtils.chuPai(socket, data);
				if (socket.timeNumber !== 2) {
					socket.timeNumber !== undefined
						? (socket.timeNumber++)
						: (socket.timeNumber = 1);
				}
			}, second);
			socket.timeout = timeout;
		});


		/**
		 * 聊天
		 * @param  {[type]} data
		 */
		socket.on('chat', async function (data) {
			if (utils.isEmpty(userId, roomId)) {
				return;
			}
			var chatContent = data;
			await sendUtils.broacastInRoomAll('chatPush', utils.sendTemp(0, '聊天', { userId: socket.userId, content: chatContent }), socket.userId, socket.roomId, true);
			// 添加聊天记录
			await Redis.addChatMsg(socket.userId, socket.roomId, chatContent);
		});


		/**
		 * 快速聊天
		 * @param  {[type]} data
		 */
		socket.on('quickChat', async function (data) {
			let userId = socket.userId;
			let roomId = socket.roomId;
			let chatId = data;
			if (utils.isEmpty(userId, roomId)) {
				return;
			}
			await sendUtils.broacastInRoomAll('quickChatPush', utils.sendTemp(0, '快速聊天', { userId: socket.userId, content: chatId }), socket.userId, socket.roomId, true);
			// 缓存聊天记录
			await Redis.addChatMsg(userId, roomId, chatId);
		});


		/**
		 * 表情
		 * @param  {[type]} data
		 */
		socket.on('emoji', async function (data) {
			let userId = socket.userId;
			let roomId = socket.roomId;
			let phizId = data;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			await sendUtils.broacastInRoomAll('emojiPush', utils.sendTemp(0, '表情聊天', { userId: socket.userId, content: phizId }), socket.userId, socket.roomId, true);
			// 缓存表情聊天记录
			await Redis.addChatMsg(userId, roomId, phizId, true);
		});


		/**
		 * 聊天记录
		 * @param  {[type]} data
		 */
		socket.on('chatHistory', async function (data) {
			let userId = socket.userId;
			let roomId = socket.roomId;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			let chatList = await Redis.getChatMsg(roomId);
			await sendUtils.sendMsg(userId, roomId, 'chatHistoryPush', utils.sendTemp(0, '聊天记录', { chatList: chatList }));
		});


		/**
		 * 退出房间
		 * @param  {[type]} data
		 */
		socket.on('exit', async function (data) {
			var userId = socket.userId;
			let roomId = socket.roomId;
			let room = await Redis.getRoom(roomId);
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			let user = await Redis.getUser(userId);
			if (user == null) return;

			//通知其它客户端，有人退出了房间
			sendUtils.broacastInRoom('exitNotifyPush', utils.sendTemp(0, `${user.userName}退出了房间`, { userId }), userId, roomId, false);

			socket.emit('exitResult');
			socket.disconnect();
		});


		/**
		 * 确定解散
		 * @param  {[type]} data
		 */
		socket.on('confirmDispress', async function (data) {
			let userId = socket.userId;
			let roomId = socket.roomId;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			socket.disconnect();
			userMgr.del(userId, roomId);
			let users = roomMgr.getAllUsersOfRoom(roomId);
			// 如果该房间内没有用户，则关闭房间并记录信息
			if (users.length == 0) {
				await userMgr.kickAllInRoom(roomId);
				await RoomRedis.destroy(roomId);
			}
		});


		/**
		 * 解散房间
		 * @param  {[type]} data
		 */
		socket.on('dissolveRequest', async function (data) {
			let userId = socket.userId;
			let roomId = socket.roomId;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			let room = await Redis.getRoom(roomId);
			if (room == null) {
				return console.log('房间不存在');
			}

			let users = await RoomRedis.getAllUsersOfRoom(roomId);
			if (users.length == 1) {
				await socketUtils.dispress(userId, roomId);
				return;
			}

			let isSit = false;
			for (let i = 0; i < room.seats.length; i++) {
				if (room.seats[i].userId > 0) {
					isSit = true;
					break;
				}
			}

			// 如果没有人坐下，且不是房主则不能发起解散请求，是房主则直接解散
			if (!isSit) {
				// 不是房主
				if (room.conf.creator != userId) return;
				else {
					await socketUtils.dispress(userId, roomId);
					return;
				}
			}

			let sitUsers = await RoomRedis.getSitUsersOfRoom(roomId);
			let all_agree = 0;
			if (sitUsers.length == 4) {
				all_agree = 4;
			} else {
				all_agree = sitUsers.length;
				if (users.indexOf(room.conf.creator) != -1 && sitUsers.indexOf(room.conf.creator) == -1)
					all_agree += 1;
			}
			let user = await Redis.getUser(userId);
			let name = '';

			if (user != null) name = user.userName;
		});


		/**
		 * 同意解散
		 * @param  {[type]} data
		 */
		socket.on('dissolveAgree', async function (data) {
			var userId = socket.userId;
			let roomId = socket.roomId;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			let room = await Redis.getRoom(roomId);
			if (room == null) return;
			let users = await RoomRedis.getAllUsersOfRoom(roomId);
			let sitUsers = await RoomRedis.getSitUsersOfRoom(roomId);
			let user = await Redis.getUser(userId);
			if (user == null) return;
		});


		/**
		 * 反对解散
		 * @param  {[type]} data
		 */
		socket.on('dissolveReject', async function (data) {
			var userId = socket.userId;
			let roomId = socket.roomId;
			if (userId == null || roomId == null) {
				return;
			}
			let room = await Redis.getRoom(roomId);
			if (room == null) return;
			let users = await RoomRedis.getAllUsersOfRoom(roomId);
			let sitUsers = await RoomRedis.getSitUsersOfRoom(roomId);
			let user = await Redis.getUser(userId);
			let name = '';
			if (user != null) {
				name = user.userName;
			}
			if (ret != null) {
				await sendUtils.broacastInRoom('dissolveCancelPush', utils.sendTemp(0, `${name}拒绝解散房间`, { name }), userId, roomId, true);
				// 要是房主还在房间则通知房主
				if (users.indexOf(room.conf.creator) != -1 && sitUsers.length !== 4) {
					userMgr.get(room.conf.creator, roomId).emit('dissolveCancelPush', utils.sendTemp(0, `${name}拒绝解散房间`, { name }));
				}
			}
		});


		/**
		 * 离开房间
		 * @param  {[type]} data
		 */
		socket.on('leave', async function (data) {
			let roomId = socket.roomId;
			let userId = socket.userId;
			if (utils.isEmpty(userId, roomId)){
				return console.log('参数错误');
			}
			let result = await RoomService.leave({ roomid: roomId, userid: userId });
			if (result == null) return socket.emit('leaveResult', utils.sendTemp(100000, '离开房间失败'));
			socket.emit('leaveResult', utils.sendTemp(0, '离开房间成功'));
			let user = await Redis.getUser(userId);
			if (user == null) return;
			await sendUtils.broacastInRoomAll('leaveNotifyPush', utils.sendTemp(0, `${user.userName}离开了房间`, { userId }), userId, roomId, true);
			await RoomRedis.delUserOfRoom(userId, roomId);
			await socketUtils.userList(socket, { userid: userId, roomid: roomId });
		});


		/**
		 * 断开链接
		 * @param  {[type]} data
		 */
		socket.on('disconnect', async function (data) {
			var userId = socket.userId;
			let roomId = socket.roomId;
			if (utils.isEmpty(userId, roomId)) {
				return console.log('参数错误');
			}
			var data = {
				userId: userId,
				online: false
			};

			//通知房间内其它客户端
			await sendUtils.broacastInRoom('userStatePush', data, userId, roomId);
			// 玩家断线准备状态设置为false
			await RoomRedis.updateUserReady(userId, roomId, false);
		});


		/**
		 * ping
		 * @param  {[type]} data
		 */
		socket.on('ping', function (data) {
			var userId = socket.userId;
			if (!userId) {
				return;
			}
			socket.emit('pong');
		});
	});

	console.log(`socket server is listening on ${config.PORT}`);
};

module.exports = {
	start
}
