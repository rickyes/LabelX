/**
 * 中间件集合
 * @type {[type]}
 * @author zhoumq
 */
const cors = require('./cors')
    , state = require('./state')
    , page404 = require('./page404')
    , log = require('./log')
    , error = require('./error')
    , controll = require('./controll');

module.exports = {
  cors,
  state,
  page404,
  log,
  error,
  controll
}
