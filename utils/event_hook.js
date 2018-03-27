/**
 * Created by wuweiwei on 2017/12/11.
 */

'use strict'


module.exports=function (configer,logger,sqlServices,cc_api) {
    var eventHooks = {};
    eventHooks.chaincodeEventHook = function (err, eventObj) {
        logger.info("Receive chain code event");
        if (err != null) {
            logger.error("Receive chaincode event error:", err);

        } else {
            if (eventObj.chaincode_id == configer.getChaincodeId() && eventObj.event_name == configer.getChaincodeEventName()) {
                var objStr = eventObj.payload.toString();
                var txObj = JSON.parse(objStr);
                if (txObj.reqBankId[0].length > 0 && txObj.reqBankId.join(",").indexOf(configer.getMyOrganizationID()) < 0) {
                    logger.info("My Organization is not included.", txObj.reqBankId, configer.getMyOrganizationID());
                    return;
                };

                //logger.info("the cert and mspid", eventObj.data.data["0"].payload.data.actions["0"].header.creator.IdBytes, eventObj.data.data["0"].payload.data.actions["0"].header.creator.Mspid);
                /*
                 if(txObj.orgId==configer.getMyOrganizationID()){
                 logger.info("My self request ignored.");
                 return ;
                 }
                 */

                sqlServices.insertReceiveRequest(txObj.txid, 0, txObj.orgId, txObj.id, txObj.reqType, txObj.timeLine, txObj.reqBankId.join(","), txObj.pubKey)
                    .then((obj) => {
                        logger.debug("Save success: ", obj);
                        respondCusInfo(txObj);
                    })
                    .catch((err) => {
                        logger.error("Save error: ", err);
                    });
            };

        };
    };


    eventHooks.blockEventHook = function (err, eventObj) {
        logger.info("Receive block  event ");

        if (err != null) {
            logger.error("Receive block event error:", err);

        } else {
            //logger.info(eventObj);

            eventObj.data.data.forEach(function(item,index)
            {
                logger.info(item.payload.data.actions["0"].payload.chaincode_proposal_payload.input.toString());

                var ret=stupid_parse(item.payload.data,configer.getChaincodeId());
                if (ret.parameters.length==0){
                    logger.debug("The tx is not belong to the:",configer.getChaincodeId());
                    return ;
                }
                if(ret.parameters.length==7) {
                    var result = ret.parameters.slice(1);
                }else{
                    var result = ret.parameters;
                }
                if (result[0]!="cusInfoRespond"){
                    logger.debug("The tx is not  cusInfoRespond ignored.");
                    return ;
                }
                result[1]=result[1].slice(1);
                handleRespond(result,eventObj.header.number);
            });

            var blockNum=eventObj.header.number;
            var dataHash=eventObj.header.data_hash;
            var previousHash=eventObj.header.previous_hash;
            var txCount=eventObj.data.data.length;

            sqlServices.insertBlockInfo(blockNum,txCount,dataHash,previousHash)
                .then((objs) => {
                })
                .catch((err) => {
                    logger.error("insertBlockInfo err:", err);
                });
        };
    };

    function respondCusInfo(txObj) {
        var options={};
        var args={};
        var date=new Date();

        args.txid=txObj.txid;
        args.orgid=configer.getMyOrganizationID();
        args.iscrypto='0'
        args.date=date.toLocaleString().substring(0,10);
        sqlServices.queryAllCusInfoByID(txObj.id).then((jsonObj)=>{
            args.respondinfo=new Buffer(JSON.stringify(jsonObj)).toString('base64');
            logger.info(args.respondinfo);
            options.args=args;
            cc_api.cus_info_respond(options,function (err,resp) {
                if (err!=null){
                    logger.error("public err:",err)
                }else {
                    sqlServices.updateChainReceiveRequestState(txObj.txid)
                        .then((obj)=>{
                            logger.debug("updateChainReceiveRequestState success ");
                        })
                        .catch((err)=>{
                            logger.error("updateChainReceiveRequestState err:",err.message);
                        });
                };
            })
        }).catch((err)=>{
            logger.error("queryAllCusInfoByID err:",err.message);
        })
    }

    function stupid_parse(data, chaincodeId) {
        var ret = { debug: {}, parameters: [] };
        var str = null;

        try {
            str = data.actions[0].payload.chaincode_proposal_payload.input.toString();
            ret.debug.original = str;
        } catch (e) {
            logger.warn('no tx data to parse for this block... might be okay');
            return ret;
        }

        // break up string
        try {
            ret.debug.startPos = str.indexOf(chaincodeId);						//dumb detection
            ret.debug.str = str.substr(ret.debug.startPos + chaincodeId.length);
            ret.debug.stopPos = ret.debug.str.indexOf('\u0012');				//this is likely to break
            if (ret.debug.stopPos > 0) ret.debug.finalStr = ret.debug.str.substr(0, ret.debug.stopPos);
            else ret.debug.finalStr = ret.debug.str;
        } catch (e) {
            logger.warn('error parsing string in stupid parse...', e);
        }

        var word = '';
        if (!ret.debug.finalStr) {
            logger.error('parsing block data finalStr is undefined...');
            ret.parameters.push('undefined');
        }
        else if (ret.debug.finalStr.length > 5000) {						//if its suspiciously long, don't process, self preservation
            logger.warn('parsing block data finalStr is too large, skipping', ret.debug.finalStr.length);
            ret.parameters.push('too long to show');
        } else {
            for (var i in ret.debug.finalStr) {								//filter out gibberish
                if (ret.debug.finalStr.charCodeAt(i) >= 32 && ret.debug.finalStr.charCodeAt(i) <= 126) {
                    word += ret.debug.finalStr[i];
                }
                else {
                    if (word.length > 0) {									//end of word, push it
                        ret.parameters.push(word);
                    }
                    word = '';
                }
            }
            if (word.length > 0) {											//end of word (also its the last word), push it
                ret.parameters.push(word);
            }
        }

        return ret;
    }

    function handleRespond(result,block_num) {
        if(result.length!=6){
            logger.error("Handle Respond err: the result array length is not 6.");
            return ;
        }
        sqlServices.findChainSelfRequestByTxID(result[1])
            .then((obj)=>{
                logger.info("find TXID:",result[1]);
                return sqlServices.insertReceiveRespond(result[1],block_num,result[2],result[3],result[4],result[5])
            })
            .then((obj)=>{
                logger.info("insert Receive Respond finish");
                try {
                    var str= new Buffer(result[5],'base64').toString();
                    var jsonObj = JSON.parse(str);
                }
                catch (err){
                    logger.error("JSON parse error:",err.message);
                }
                sqlServices.recoverRespondCusInfo(jsonObj,result[1],result[2],result[4]);
            })
            .then((obj)=>{
                logger.info("recoverRespondCusInfo finish");
            })
            .catch((err)=>{
                logger.debug("handle Respond error:",err.message);
            });
    }

    return eventHooks;
}



