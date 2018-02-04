/**
 * 默认配置文件
 * @version 0.0.1
 * @author zhoumq
 * @type {Object}
 */
module.exports = {
  app: {
    PORT: 4000
  },
  mysql: {
    USERNAME: 'root',
    PASSWORD: '!@#$%^',
    HOST: 'localhost',
    PORT: '3306',
    DATABASE: 'LabelX'
  },
  redis: {
    HOST: 'localhost',
    AUTH: '!@#$%^',
    DB: 0,
    PORT: 6379,
    FAMILY: 4  // 4 (IPv4) or 6 (IPv6)
  },
  socket: {
    PORT: 40001
  },
  log: {
    appenders:{
        error: {
            category: "errorLogger",            //logger名称
            type: "dateFile",                   //日志类型
            filename: "logs/error",             //日志输出位置
            alwaysIncludePattern: true,         //是否总是有后缀名
            pattern: "-yyyy-MM-dd.log"          //后缀，每小时创建一个新的日志文件
        },
        response: {
            category: "resLogger",
            type: "dateFile",
            filename: "logs/app",
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd.log"
        }
    },
    categories : {
        error: { appenders: ['error'], level: 'error' },
        response: { appenders: ['response'], level: 'info' },
        default: { appenders: ['response'], level: 'info' }
    }
  }
}
