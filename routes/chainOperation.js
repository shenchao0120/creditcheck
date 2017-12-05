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
        return "'"+item+"'"
    }).join(',');

    var options={};
    var args={}
    args.cusId=req.body.cus_id_num;
    args.orgId=req.app.configer.getMyOrganizationID();
    args.reqType=req.body.req_type
    args.reqOrgIDs=orgstring;
    args.timeLine=req.body.time_line;
    options.args=args;

    req.app.cc_api.create_info_request(options,function (err,resp) {
        if(err!=null) {
            res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
            res.end("交易失敗");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
            res.end("交易成功");

        }
    });

});

module.exports = router;
