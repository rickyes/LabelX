/**
 * 加密工具集合
 * @version 0.0.1
 * @author zhoumq
 */
const crypto = require('crypto');

/**
 * md5 加密
 * @param  {[type]} content 未加密内容
 * @return {[type]}         已加密的内容
 */
function md5(content) {
	var md5 = crypto.createHash('md5');
	md5.update(content);
	return md5.digest('hex');
}


/**
 * base64 加密
 * @param  {[type]} content 未加密的信息
 * @return {[type]}         已加密的信息
 */
function toBase64(content){
	return new Buffer(content).toString('base64');
}


/**
 * base64 解密
 * @param  {[type]} content 已加密的信息
 * @return {[type]}         解密的信息
 */
function fromBase64(content){
	return new Buffer(content, 'base64').toString();
}

module.exports = {
	md5,
	toBase64,
	fromBase64
}
