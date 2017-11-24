/**
 * 数据库Model
 * @version 0.0.1
 * @author zhoumq
 */
const Sequelize = require('sequelize')
    , config = require('config-lite')(__dirname).mysql;

var sequelizeUtil = new Sequelize(config.DATABASE,config.USERNAME,config.PASSWORD,{
    dialect: 'mysql',
    host: config.HOST,
    port: config.PORT,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
});

var UserModel = sequelizeUtil.import('../modules/t_users');
var RoomModel = sequelizeUtil.import('../modules/t_rooms');
var RoomConfigModel = sequelizeUtil.import('../modules/t_room_configs');
var RoomUserModel = sequelizeUtil.import('../modules/t_room_users');

module.exports = {
    UserModel,
    RoomModel,
    RoomConfigModel,
    RoomUserModel
}
