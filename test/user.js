const assert = require('assert')
    , request = require('superagent');

var obj = {}

describe('用户单元测试',function(){

    before(function(){
        obj = {
            name: 'test5',
            token: "!@#$%^&*"
        }
    });

    // describe('创建用户',function(){
    //     it('post user/create',function(done){
    //         request
    //          .post('http://10.0.0.251:4000/user/create')
    //          .send(obj)
    //          .end(function(err,data){
    //          if(err) console.log(err);
    //          else console.log(data.body);
    //          done();
    //         });
    //     });
    // });


    describe('获取用户信息',function(){
        it('post user/info',function(done){
            request
             .post('http://10.0.0.251:4000/user/info')
             .send(obj)
             .end(function(err,data){
             if(err) console.log(err);
             else console.log(data.body);
             done();
            });
        });
    });
});
