const assert = require('assert')
  , request = require('superagent');

var obj = {}
/**
 * 房间路由接口单元测试
 */
describe('房间单元测试', function () {

  before(function () {
    obj = {
      roomId: 204,
      token: "!@#$%^&*"
    }
  })

  /**
 * 创建房间
 */
  // describe('POST room/create/', function () {
  //   it('创建房间',function(done){
  //     obj.piece = 4;
  //     obj.baseScore = 2;
  //     obj.laizi = 9;
  //     request
  //       .post('http://10.0.0.251:4000/room/create')
  //       .send(obj)
  //       .end(function(err,data){
  //         if(err) console.log(err);
  //         else console.log(data.body);
  //         done();
  //       });
  //   })
  // })

  /**
   * 房间信息
  //  */
  describe('POST room/info/', function () {
      it('房间信息',function(done){
        request
          .post('http://10.0.0.251:4000/room/info')
          .send(obj)
          .end(function(err,data){
            if(err) console.log(err);
            else console.log(data.body);
            done();
          });
      })
  })

  /**
   * 房间内用户
   */
  // describe('POST room/users/', function () {
  //   it('房间内用户',function(done){
  //     request
  //       .post('http://10.0.0.251:4000/room/users')
  //       .send(obj)
  //       .end(function(err,data){
  //         if(err) console.log(err);
  //         else console.log(data.body.datas.users);
  //         done();
  //       });
  //   })
  // })

  /**
   * 进入房间
   */
  // describe('POST room/enter/', function () {
  //   it('进入房间',function(done){
  //     request
  //       .post('http://10.0.0.251:4000/room/enter')
  //       .send(obj)
  //       .end(function(err,data){
  //         if(err) console.log(err);
  //         else console.log(data.body);
  //         done();
  //       });
  //   })
  // })

  /**
  * 查询该用户是否有房间在进行
  */
  // describe('POST room/findRoom/', function () {
  //   it('该用户是否有房间在进行', function (done) {
  //     request
  //       .post('http://10.0.0.251:4000/room/findRoom')
  //       .send(obj)
  //       .end(function (err, data) {
  //         if (err) console.log(err);
  //         else console.log(data.body);
  //         done();
  //       });
  //   })
  // })

})
