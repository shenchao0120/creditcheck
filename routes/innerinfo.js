/**
 * Created by wuweiwei on 2017/11/29.
 */


var express = require('express');
var router = express.Router();               //路由模块
var co = require('co');



/* GET users listing. */
router.get('/cusinfo', function(req, res, next) {
    var page=req.query.page;
    if (page==null){
        page=1;
    }
    co(function *() {
        var result = yield [
            req.app.sqlServices.findCusBaseInfoByPage(page)
                .then((objs) => {
                    return objs;
                })
                .catch((err) => {
                    console.log("FindCusBaseInfoByPage err:", err);
                }),

            req.app.sqlServices.queryCusBaseInfoPageNum()
                .then((count) => {
                    return count;
                })
                .catch((err) => {
                    console.log("queryCusBaseInfoPageNum err:", err);
                })
        ];
        res.render('innercusinfo', {objs: result[0], pageNum: result[1],curPage:page});
    }).catch((err) => {
        console.log("CusBaseInfo err:", err);
        res.render('innercusinfo', {});
    })
});


/* GET users listing. */
router.get('/cusinfo/detail/', function(req, res, next) {

    co(function* (){
        var result = yield [
            req.app.sqlServices.findCusBaseInfoByCusId(req.query.cus_id).then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findCusCreditInfoByCusId(req.query.cus_id).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findCusDepositInfoByCusId(req.query.cus_id).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusDepositInfo err:",err);
                }),
            req.app.sqlServices.findCusRepayInfoByCusId(req.query.cus_id).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusRepayInfo err:",err);
                })
        ];
        res.render('innercusinfodetail',{
            cusBaseInfo:result[0],
            cusCreditInfo:result[1],
            cusDepositInfo:result[2],
            cusRepayInfo:result[3]
        });
    }).catch((err)=>{
        console.log("Query cus detail info err:",err);
        res.render('innercusinfodetail',[]);

    });

});


module.exports = router;


/*
 console.log("render");
 req.app.sqlServices.findCusBaseInfoByIdNum('120102198901203034')
 .then((obj)=>{
 console.log("the CusBaseInfo:",obj);})
 .catch((err)=>{
 console.log("CusBaseInfo err:",err);
 });
 console.log("render2");
*/
