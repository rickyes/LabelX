# LabelX
Koa2 游戏基础框架

[![Build Status](https://travis-ci.org/rickyes/LabelX.svg?branch=master)](https://travis-ci.org/rickyes/LabelX)
[![npm](https://img.shields.io/npm/v/npm.svg)](https://github.com/rickyes/LabelX)
[![node](https://img.shields.io/badge/node-%3E%3D8-green.svg)](https://github.com/rickyes/LabelX)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/rickyes/LabelX)

### 小型游戏服务端开发框架

```├── app.js 
├── common  控制器/mysql持久化服务/socket.io服务
├── config  配置文件
├── coverage 代码覆盖率
├── logs  日志
├── middlewares 自定义中间件
├── modules  sequelize Model
├── public  静态文件托管目录
├── routes 路由集合
├── test  单元测试
├── utils 工具集合
├── package.json
├── package-lock.json
└── views  视图
```

### develop

#### 用 [labelx-cli](https://github.com/zhoumingque/labelx-cli) 来初始化项目

[![NPM](https://nodei.co/npm/labelx-cli.png?compact=true)](https://nodei.co/npm/labelx-cli/)

#### install labelx-cli

```bash
$ npm i labelx-cli -g
```

#### bax init

```bash
$ bax init [name]
```

#### run

```bash
$ cd [name] && npm run dev
```
> 版本：Node.js V8.1.0，ORM Sequelize

需要修改配置文件： config/default.js
修改mysql、redis 地址
### 添加路由（router）

在routes文件夹下，添加一级路由，如：添加一个游戏一级路由，则新建game.js，然后在里面添加info二级路由，
把game.js挂载到index.js暴露给外部使用，接口地址为：${host}:port/game/info

### 添加控制器（controller）

每个一级路由文件对应一个controller文件，controller文件在common/controllers/下面，该文件的作用是处理接口的数据并调用service持久化到数据库

### 添加mysql持久化服务（service）

每个控制器对应一个或多个service,将controller传递过来的数据进行读写

### 访问队列 （[LockX](https://github.com/zhoumingque/LockX)）









### ----

觉得有用的话，麻烦star一下呗。。。
