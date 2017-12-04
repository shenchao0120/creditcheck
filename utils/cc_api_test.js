/*
cc_api=require(__dirname+'/utils/creditcheck_cc_api.js')(obj,g_option,fcw,logger);

 var options={};
 var args={}
 args.cusId='CUSID000001';
 args.orgId='ORGID000001';
 args.reqType='0';
 args.reqOrgIDs='ORGID000001,ORGID000002,ORGID000003,ORGID000004';
 args.timeLine='0';
 options.args=args;

 cc_api.create_info_request(options,function (err,resp) {
 if (err!=null){
 logger.error(err)
 }else {
 logger.info(resp);
 }
 });

cc_api.query_all_request(function (err,resp) {
    if(err!=null) {
        logger.error("query error:" + err);
    }else {
        logger.info("query success:",resp);
    };

 var options={};
 var args={};
 date=new Date();

 args.txid='51f5b3f2d4b545411e48aad3043619b9cb4183b482b4876bbf053122c5a9cf66';
 //args.orgid=configer.getMyOrganizationID();
 args.orgid="ORGID000003";
 args.iscrypto='0';
 args.date=date.toLocaleString().substring(0,10);
 args.respondinfo="Cus000001's detail informations 3....";
 options.args=args;

 cc_api.cus_info_respond(options,function (err,resp) {
 if(err!=null) {
 logger.error("cus_info_respond error:" + err);
 }else {
 logger.info("cus_info_respond success:",resp);
 }
 });

 var date=new Date();

 options.args.cusid="CUSID00000a";
 options.args.orgid=configer.getMyOrganizationID();
 options.args.date=date.toLocaleString().substring(0,10);
 var cusInfo={
 "cus_id":"CUSID00000a",
 "cus_name":"shenchao",
 "gender":"male",
 "phone":"18522100170",
 "age":"28"
 };
 options.args.cusinfo=JSON.stringify(cusInfo);

 cc_api.public_cus_info(options,function (err,resp) {
 if (err!=null){
 logger.error("public err:",err)
 }else {
 logger.info("public success:",resp);
 };
 })

 cc_api.query_all_public(function (err,resp) {
 if (err != null) {
 logger.error("query error:" + err);
 } else {
 logger.info("query success:", resp);
 var cusinfo=resp.parsed[0].cusInfo;
 var buf = new Buffer(cusinfo, 'base64')
 var cusobj=JSON.parse(buf.toString('utf8'));
 logger.info(cusobj.cus_name);
 };
 });

*/