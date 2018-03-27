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

var str='ZXlKamRYTkNZWE5sU1c1bWJ5STZleUpqZFhOZmFXUWlPakVzSW1OMWMxOXVZVzFsSWpvaTU1U3o2TGFGSWl3aVkzVnpYMmxrWDI1MWJTSTZJakV5TURFd01qRTVPRGt3TVRJd016QXpOQ0lzSW1kbGJtUmxjaUk2SWswaUxDSndhRzl1WlY5dWRXMGlPaUl4T0RVeU1qRXdNREUzTVNJc0ltSnBjblJvWkdGNUlqb2lNVGs0T1Mwd01TMHdNU0lzSW0xaGNuSnBZV2RsSWpvaVdTSXNJbVZ0WVdsc0lqb2ljMmhsYm1Ob1lXOHdNVEl3UURFMk15NWpiMjBpTENKamFYUjVJam9pVkdsaGJrcHBiaUlzSW1Ga1pISmxjM01pT2lMbHBLbm10S1hsdUlMbXNyUGt1SnpsakxybXRiZm1zclBrdUp6b3Q2OHlNVGpsajdjaUxDSmpiMjF3WVc1NUlqb2lRMEpJUWlKOUxDSmpkWE5EY21Wa2FYUkpibVp2SWpwYmV5SmpkWE5mYVdRaU9qRXNJbUoxYzE5MGVYQmxJam9pWTJGeVpDSXNJbUoxYzE5dWJ5STZJakl3TURFeU16UTFOamNpTENKaVpXZHBibDlrZENJNklqSXdNVFV0TURFdE1ERWlMQ0p6WlhSc1gyUjBJam9pTWpBME5TMHdNUzB3TVNJc0ltTmplU0k2SWtOT1dTSXNJbTlrWDNScGJXVnpJam93TENKd1lYbGZkVzVwZENJNklrMGlMQ0p3WVhsZmJuVnRJam96TmpBc0ltUmxZblJmUVcxMElqb3hNREF3TURBd0xDSnpaWFJzWDBGdGRDSTZNakF3TURBc0ltOWtYMEZ0ZENJNk1Dd2liM2R1WDJsdWRDSTZNVEV3TUN3aWMyVjBiRjlwYm5RaU9qRXdNREFzSW05a1gybHVkQ0k2TUN3aWNtVnRZV2x1WDNCaGVWOXVkVzBpT2pNd01Dd2libmgwWDNCaGVWOWtkQ0k2SWpJd01UY3RNVEl0TVRVaUxDSnNZWE4wWDNCaGVWOWtkQ0k2SWpJd01UY3RNVEV0TVRVaUxDSnRiMjUwYUY5d1lYbGZZVzEwSWpvME1EQXdMQ0p2WkY5a1lYbHpJam93TENKdmQyNWZiMlJmYVc1MElqb3dMQ0p6WlhSZmIyUmZhVzUwSWpvd0xDSmpiR0Z6YzJWeklqb2lNU0lzSW1OMWMxOXBaRjl1ZFcwaU9pSXhNakF4TURJeE9UZzVNREV5TURNd016UWlmVjBzSW1OMWMwUmxjRzl6YVhSSmJtWnZJanBiZXlKamRYTmZhV1FpT2pFc0ltRmpZMTkwZVhCbElqb2laR1Z3YnlJc0ltRmpZMTl1YnlJNklqRXdNREF3TURBek5EVTJJaXdpWVdOalgzTjBZWFJsSWpvaU1TSXNJbTl3Wlc1ZlpIUWlPaUl5TURFMExURXlMVEF4SWl3aVkyTjVJam9pUTA1Wklpd2liM0JsYmw5aVlXNXJJam9pNXJpazVyVzM2Wk8yNktHTTVhU3A1clNsNVlpRzZLR01JaXdpWW1Gc1lXNWpaU0k2TWpBd01EQXNJbU4xYzE5cFpGOXVkVzBpT2lJeE1qQXhNREl4T1RnNU1ERXlNRE13TXpRaWZWMHNJbU4xYzFKbGNHRjVTVzVtYnlJNlczc2lZM1Z6WDJsa0lqb3hMQ0ppZFhOZmRIbHdaU0k2SW14dllXNGlMQ0ppZFhOZmJtOGlPaUl5TURBNE5UUXpNakV3SWl3aVkyTjVJam9pUTA1Wklpd2ljR1Z5WkY5dWJ5STZNVEFzSW5Ob1pGOXdZWGxmWkhRaU9pSXlNREUzTFRFeExURTFJaXdpY21WaGJGOXdZWGxmWkhRaU9pSXlNREUzTFRFeExURTFJaXdpYzJoa1gzQmhlVjloYlhRaU9qUXdNREFzSW5KbFlXeGZjR0Y1WDJGdGRDSTZOREF3TUN3aWIyUmZaR0Y1Y3lJNk1Dd2lZM1Z6WDJsa1gyNTFiU0k2SWpFeU1ERXdNakU1T0Rrd01USXdNekF6TkNKOVhYMD0=';
var strb=new Buffer(str,'base64').toString('');
console.log(strb);
var strc=new Buffer(strb,'base64').toString('');

var obj=JSON.parse(strc);
console.log(obj);