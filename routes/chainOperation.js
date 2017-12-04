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
    console.log('the parameters:',req.body.cus_id_num,req.body.req_type,req.body.time_line,req.body.req_orgs);
    res.render('chainpublishrequest');

});

module.exports = router;
