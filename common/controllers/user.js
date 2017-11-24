/**
 * user 控制器集合
 * @type {Object}
 * @author zhoumq
 * @company Flym
 */
const utils = require('../../utils/utils')
    , cryptoUtils = require('../../utils/cryptoUtils')
    , UserService = require('../services/user')
    , superagent = require('superagent')
    , config = require('config-lite')(__dirname);

/**
 * 创建用户
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
async function createUser(ctx){
  let postData = ctx.request.body;
  if(utils.isEmpty(postData)) return utils.send(ctx,1,'unknow error');
  let name = postData.name;
  if(utils.isEmpty(name)) return utils.send(ctx,1,'unknow error');
  let coins = 1000;
  let gems = 21;
  let ip = ctx.request.ip.indexOf('::ffff:')!==-1 ? ctx.request.ip.substr(7) : ctx.request.ip;
  let isHave = await UserService.isUserExist(name)
  if(isHave == null){
    // name = cryptoUtils.toBase64(name);
    let params = {
      address:'广州市',
      name: name,
      exp: 0,
      gems: gems,
      gold: 0,
      winrate: 0,
      all_game: 0,
      score: 0,
      ip: ip,
      sex: '男',
      headimg: 'https://avatars0.githubusercontent.com/u/20432815?v=4&s=460'
    }
    let isSuc = await UserService.createUser(params);
    ctx.body = isSuc;
  }
}

/**
 * 用户详情
 * @param  {[type]} ctx
 */
async function getUserInfo(ctx,next){
  let req = ctx.request;
  let token = req.body.token;
  if(utils.isEmpty(token)) return utils.send(ctx,100060,'参数错误');
  let obj = {
    appKey: 'nodejs',
    token: token
  }
  let signStr = utils.sign(obj);
  obj.sign = cryptoUtils.md5(signStr);
  let userResult = await superagent
    .post(`${config.user.ip}/userInfo`)
    .send(obj);
  if(userResult == null) return utils.send(ctx,100060,'参数错误');
  if(userResult.body == null){
    return utils.send(ctx,100060,'没有该用户');
  }
  if(userResult.body.result == '100050'){
    return utils.send(ctx,100050,'token失效');
  }else if(userResult.body.result == '0'){
    if(userResult.body.datas.userId != null){
      utils.send(ctx,0,'获取用户信息成功',userResult.body.datas);
    }
  }

}

module.exports = {
  createUser,
  getUserInfo
}
