/**
 * user services接口集合
 * @type {Object}
 * @author zhoumq
 */
const { UserModel } = require('../../utils/dbUtils')
    , utils = require('../../utils/utils');

/**
 * 查找账户是否存在
 * @param  {[type]}  name 用户昵称
 * @return {Boolean}      是否存在
 */
async function isUserExist(name){
  return await UserModel.findOne({
    where: {name: name},
    attributes: ['userid']
  });
}

/**
 * 创建用户
 * @param  {[type]} params 用户参数
 * @return {[type]}        创建结果
 */
async function createUser(params){
  return await UserModel.create(params);
}

/**
 * 获取账户信息
 * @param  {[type]} userid 用户id
 * @return {[type]}        用户信息
 */
async function getUserData(userid){
  return await UserModel.findOne({
    where: {userid: userid}
  });
}

module.exports = {
  isUserExist,
  createUser,
  getUserData
}
