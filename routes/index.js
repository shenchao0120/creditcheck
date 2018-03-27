var express = require('express');
var router = express.Router();
var crypto=require('crypto');
var co=require('co');



/* GET home page. */
router.get('/', function(req, res, next) {
    co(function* (){
        var result = yield [
            req.app.sqlServices.getTxCount().then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("getTxCount err:",err);
                }),
            req.app.sqlServices.getLocalCusCount().then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("getLocalCusCount err:",err);
                }),
            req.app.sqlServices.getChainRequestCount().then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("GetChainRequestCount err:",err);
                })
        ];
        res.render('index', {
            username: req.userInfo.username ,
            low:req.app.channelinfo.low,
            tx_num:result[0],
            localcusnum:result[1],
            chainrequest:result[2]
        });
    }).catch((err)=>{
        console.log("Query cus count info err:",err);
        res.render('index',{username: req.userInfo.username , low:req.app.channelinfo.low});
    });

});

router.get('/login', function(req, res, next) {
    if(!req.userInfo||!req.userInfo.isLogin){
        res.render('login');
    }else{
        res.redirect('/');
    }
});

router.post('/login', function(req, res, next) {
    if(req.userInfo && req.userInfo.isLogin){
        res.redirect('/');
    }else {
        var username = req.body.username;
        var passwd = req.body.password;
        var sqlServices=req.app.sqlServices;

        var user = sqlServices.findUser(username).then((obj) => {
            if (obj == null) {
                res.json({status:1,msg:'用户名不存在！'}) ;
            } else {
                // 生成密文，默认HMAC函数是sha1算法
                var salt = "abcdefghijklmnopqrstuvwxyz";
                crypto.pbkdf2(passwd, salt, 4096, 25, function (err, hash) {
                    if (err) {
                        throw err;

                    }
                    var degist = hash.toString('hex');

                    if (degist == obj.user_password) {
                        req.cookies.set('userInfo', JSON.stringify({
                            user_id: obj.user_id,
                            username: obj.user_loginName
                        }));
                        res.json({status:0,path:'/'}) ;
                    } else {

                        res.json({status:2,msg:'密码错误！'}) ;
                    }
                });
            };
        }).catch((err)=>{

            res.json({status:1,msg:'用户名不存在！'}) ;
        });
    }
});

router.get('/logout',function (req,res,next) {
    req.cookies.set('userInfo',null);
    res.redirect('/login');
});

module.exports = router;
