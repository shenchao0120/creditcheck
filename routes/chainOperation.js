/**
 * Created by wuweiwei on 2017/12/4.
 */


var express = require('express');
var router = express.Router();               //路由模块
var co = require('co');


/* GET users listing. */
router.get('/publishrequest', function(req, res, next) {
    console.log('publishrequest');
    res.render('chainpublishrequest');

});

router.post('/publishrequest', function(req, res, next) {

    var orgArray=req.body.req_orgs.split(",");
    var orgstring=orgArray.map(function (item) {
        return item
    }).join(',');

    var options={};
    var args={}
    args.cusId=req.body.cus_id_num;
    args.orgId=req.app.configer.getMyOrganizationID();
    args.reqType=req.body.req_type
    args.reqOrgIDs=req.body.req_orgs;
    args.timeLine=req.body.time_line;
    options.args=args;

    req.app.cc_api.create_info_request(options,function (err,resp) {
        if(err!=null) {
            req.app.logger.error("public err:",err);
            res.status(500).json({error:err});
        }
        else {
            res.status(200).json({tx_id:resp.tx_id});
            res.end("交易成功");
            req.app.sqlServices.insertSubmitRequest(resp.tx_id,args.cusId,args.reqType,args.timeLine,args.reqOrgIDs)
                .then((obj)=>{
                    req.app.logger.debug("Save success: ",obj);
                })
                .catch((err)=>{
                    req.app.logger.error("Save error: ",err);
                });
        }
    });
});


router.get('/queryselfrequest', function(req, res, next) {
    var page=req.query.page;
    if (page==null){
        page=1;
    }
    co(function *() {
        var result = yield [
            req.app.sqlServices.findChainSelfRequest(page)
                .then((objs) => {
                    return objs;
                })
                .catch((err) => {
                    req.app.logger.error("FindChainSelfRequest err:", err);
                }),

            req.app.sqlServices.queryChainSelfRequestPageNum()
                .then((count) => {
                    return count;
                })
                .catch((err) => {
                    req.app.logger.error("QueryChainSelfRequestPageNum err:", err);
                })
        ];
        res.render('chainselfrequest', {objs: result[0], pageNum: result[1],curPage:page});
    }).catch((err) => {
        req.app.logger.error("ChainSelfRequest err:", err);
        res.render('chainselfrequest', {});
    })

});


router.get('/queryreceiverequest', function(req, res, next) {
    var page=req.query.page;
    if (page==null){
        page=1;
    }
    co(function *() {
        var result = yield [
            req.app.sqlServices.findChainReceiveRequest(page)
                .then((objs) => {
                    return objs;
                })
                .catch((err) => {
                    req.app.logger.error("FindChainReceiveRequest err:", err);
                }),

            req.app.sqlServices.queryChainReceiveRequestPageNum()
                .then((count) => {
                    return count;
                })
                .catch((err) => {
                    req.app.logger.error("QueryChainReceiveRequestPageNum err:", err);
                })
        ];
        result[0].forEach(function (item) {
            item.from_orgID=req.app.configer.getOrgChsName(item.from_orgID);
        });
        res.render('chainreceiverequest', {objs: result[0], pageNum: result[1],curPage:page});
    }).catch((err) => {
        req.app.logger.error("ChainReceiveRequest err:", err);
        res.render('chainreceiverequest', {});
    })

});


/* GET users listing. */
router.get('/respondinfo/detail/', function(req, res, next) {
    co(function* (){
        var result = yield [
            req.app.sqlServices.findReceiveBaseInfo(req.query.tx_id,req.query.from_orgID).then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findReceiveCreditInfo(req.query.tx_id,req.query.from_orgID).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findReceiveDepositInfo(req.query.tx_id,req.query.from_orgID).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusDepositInfo err:",err);
                }),
            req.app.sqlServices.findReceiveRepayInfo(req.query.tx_id,req.query.from_orgID).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusRepayInfo err:",err);
                })
        ];
        res.render('respondinfodetail',{
            cusBaseInfo:result[0][0],
            cusCreditInfo:result[1],
            cusDepositInfo:result[2],
            cusRepayInfo:result[3]
        });
    }).catch((err)=>{
        console.log("Query cus detail info err:",err);
        res.render('respondinfodetail',[]);
    });

});

/* GET users listing. */
router.get('/respondinfo', function(req, res, next) {
    var page=req.query.page;
    if (page==null){
        page=1;
    }
    co(function *() {
        var result = yield [
            req.app.sqlServices.queryReceiveRespondByPage(req.query.tx_id,page)
                .then((objs) => {
                    return objs;
                })
                .catch((err) => {
                    console.log("queryReceiveRespondByPage err:", err);
                }),

            req.app.sqlServices.queryReceiveRespondPageNum(req.query.tx_id)
                .then((count) => {
                    return count;
                })
                .catch((err) => {
                    console.log("queryReceiveRespondPageNum err:", err);
                })
        ];
        result[0].forEach(function (item) {
            item.from_orgName=req.app.configer.getOrgChsName(item.from_orgID);
        });
        res.render('respondinfo', {objs: result[0],tx_id:req.query.tx_id, cus_id_num:req.query.cus_id_num,req_dt:req.query.req_dt,pageNum: result[1],curPage:page});
    }).catch((err) => {
        console.log("respondinfo err:", err);
        res.render('respondinfo', {});
    })
});


router.get('/publishcusinfo', function(req, res, next) {
    console.log('publishcusinfo');
    res.render('publishcusinfo');

});


router.post('/publishcusinfo', function(req, res, next) {
    console.log('publishcusinfo searchlocal');
    co(function* (){
        var result = yield [
            req.app.sqlServices.findCusBaseInfoByIdNum(req.body.cus_id_num).then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findCusCreditInfoByCusIdNum(req.body.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findCusDepositInfoByCusIdNum(req.body.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusDepositInfo err:",err);
                }),
            req.app.sqlServices.findCusRepayInfoByCusIdNum(req.body.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusRepayInfo err:",err);
                })
        ];
        var cusInfo={
            cusBaseInfo:result[0],
            cusCreditInfo:result[1],
            cusDepositInfo:result[2],
            cusRepayInfo:result[3]
        };
        var cusInfobase64=new Buffer(JSON.stringify(cusInfo)).toString('base64');

        var options={};
        var args={}
        options.args=args;

        var date=new Date();

        options.args.cusid=req.body.cus_id_num;
        options.args.orgid=req.app.configer.getMyOrganizationID();
        options.args.date=date.toLocaleString().substring(0,10);
        options.args.cusinfo=cusInfobase64;
        req.app.cc_api.public_cus_info(options,function (err,resp) {
            if (err!=null){
                req.app.logger.error("public err:",err);
                res.status(500).json({error:err});

            }else {
                req.app.logger.info("public success:",resp.tx_id);
                res.status(200).json({tx_id:resp.tx_id});
                res.end();
            };
        })

    }).catch((err)=>{
        console.log("Query cus detail info err:",err);
        res.status(500).json({error:err});
    });
});


router.get('/publishcusinfo/searchlocal', function(req, res, next) {
    console.log('publishcusinfo');
    co(function* (){
        var result = yield [
            req.app.sqlServices.findCusBaseInfoByIdNum(req.query.cus_id_num).then((obj)=>{
                return obj;})
                .catch((err)=>{
                    console.log("CusBaseInfo err:",err);
                }),
            req.app.sqlServices.findCusCreditInfoByCusIdNum(req.query.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusCreditInfo err:",err);
                }),
            req.app.sqlServices.findCusDepositInfoByCusIdNum(req.query.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusDepositInfo err:",err);
                }),
            req.app.sqlServices.findCusRepayInfoByCusIdNum(req.query.cus_id_num).then((objs)=>{
                return objs;})
                .catch((err)=>{
                    console.log("CusRepayInfo err:",err);
                })
        ];
        res.render('respondinfodetail',{
            cusBaseInfo:result[0],
            cusCreditInfo:result[1],
            cusDepositInfo:result[2],
            cusRepayInfo:result[3]
        });
    }).catch((err)=>{
        console.log("Query cus detail info err:",err);
        res.render('respondinfodetail',[]);
    });

});

router.get('/querypublicinfo', function(req, res, next) {
    console.log('querypublicinfo');
    req.app.cc_api.query_all_public(function (err, resp) {
        if (err != null) {
            req.app.logger.error("query error:" + err);
            res.status(500).json({error:err});
        } else {
            req.app.logger.info("query success:", resp);
            var results=[];
            for(var idx in resp.parsed) {
                try {
                    var stra = new Buffer(resp.parsed[idx].cusInfo, 'base64').toString();
                    var strb = new Buffer(stra, 'base64').toString();
                    var cusobj = JSON.parse(strb);
                    var result={
                        cusid:resp.parsed[idx].cusId,
                        orgid:req.app.configer.getOrgChsName(resp.parsed[idx].orgId),
                        date:resp.parsed[idx].Date,
                        cusInfo:cusobj
                    };
                    results.unshift(result);
                    results.sort(function (a,b) {
                         if(a.date>b.date){
                             return -1;
                         }else if (a.date<b.date){
                             return 1;
                         }
                         return 0;
                    })
                }
                catch (err) {
                    req.app.logger.error("JSON parse error:",err);
                }
            }
            res.render('chainquerypublic',{results:results});
        };
    });

});

module.exports = router;
