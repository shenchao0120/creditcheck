/**
 * Created by wuweiwei on 2017/11/27.
 */

module.exports=function (enrollObj,g_options,fcw,logger) {
    var creditcheck_cc={}
    const CusRequestIndex = 'cusRequest'

    creditcheck_cc.check_if_already_instantiated=function (cb) {
        logger.info('Checking for chaincode...');
        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            cc_function: 'queryAllRequest',
            cc_args: ['']
        };
        fcw.query_chaincode(enrollObj,opts,function (err,resp) {
            if (err!=null) {
                if (cb) {
                    cb(err,resp)
                }
            }
            else {
                if (resp.parsed == null || isNaN(resp.parsed)) {	 //if nothing is here, no chaincode
                    if (cb) return cb({ error: 'chaincode not found' }, resp);
                }
                else {
                    if (cb) return cb(null, resp);
                }
            }
        });
    };

    creditcheck_cc.create_info_request = function (options, cb) {
        console.log('');
        logger.info('Creating a Cus info request ...');

        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            endorsed_hook: options.endorsed_hook,
            ordered_hook: options.ordered_hook,
            cc_function: 'cusInfoRequest',
            cc_args: [
                options.args.cusId,
                options.args.orgId,
                options.args.reqType,
                options.args.reqOrgIDs,
                options.args.timeLine
            ],
        };
        fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
            if (cb) {
                cb(err, resp);
            }
        });
    };

    creditcheck_cc.query_all_request = function (cb) {
        console.log('');
        logger.info('Query all Cus info request ...');

        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            cc_function: 'queryAllRequest',
            cc_args: [],
        };
        fcw.query_chaincode(enrollObj, opts, function (err, resp) {
            if (cb) {
                cb(err, resp);
            }
        });
    };

    creditcheck_cc.cus_info_respond = function (options, cb) {
        console.log('');
        logger.info('Respond the Cus info request ...');

        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            cc_function: 'cusInfoRespond',
            cc_args: [
                options.args.txid,
                options.args.orgid,
                options.args.iscrypto,
                options.args.date,
                options.args.respondinfo
            ],
        };
        fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
            if (cb) {
                cb(err, resp);
            }
        });
    };

    creditcheck_cc.query_all_respond=function (options,cb) {
        logger.info('Query all the Cus info responds ...');
        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            cc_function: 'queryAllRespond',
            cc_args: [
                options.args.txid
            ],
        };
        fcw.query_chaincode(enrollObj,opts,function(err,resp){
            if (cb) {
                cb(err, resp);
            }
        })
    };

    creditcheck_cc.public_cus_info = function (options, cb) {
        console.log('');
        logger.info('Public the Cus info  ...');

        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            cc_function: 'publicCusInfo',
            cc_args: [
                options.args.cusid,
                options.args.orgid,
                options.args.date,
                options.args.cusinfo
            ],
        };
        fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
            if (cb) {
                cb(err, resp);
            }
        });
    };

    creditcheck_cc.query_all_public = function (cb) {
        console.log('');
        logger.info('Query all public Cus info ...');

        var opts = {
            peer_urls: g_options.peer_urls,
            peer_tls_opts: g_options.peer_tls_opts,
            channel_id: g_options.channel_id,
            chaincode_id: g_options.chaincode_id,
            chaincode_version: g_options.chaincode_version,
            event_urls: g_options.event_urls,
            cc_function: 'queryAllPublic',
            cc_args: [],
        };
        fcw.query_chaincode(enrollObj, opts, function (err, resp) {
            if (cb) {
                cb(err, resp);
            }
        });
    };

    creditcheck_cc.setupEventHub=function (websocket,channelinfo) {
        logger.debug('[cc_api] setupEventHub');
        var eventHub;
        var client = enrollObj.client;
        // Setup EventHub
        if (g_options.event_url) {
            console.log('------------------ test');
            logger.debug('[cc_api] listening to event url', g_options.event_url);
            eventHub = client.newEventHub();
            eventHub.setPeerAddr(g_options.event_url, {
                pem: g_options.peer_tls_opts.pem,
                'ssl-target-name-override': g_options.peer_tls_opts.common_name,		//can be null if cert matches hostname
                'grpc.http2.keepalive_time': 15
            });
            eventHub.connect();
        } else {
            logger.debug('[cc_api] will not use tx event');
        }
        eventHub.registerBlockEvent(
            (block) => {
                logger.info("[cc_api] Receive block event.")
                var block_height = block.header.number;
                var tx_num = block.data.data.length;
                websocket.broadcastMsg('block','new_block',{block_height:block_height,tx_num:tx_num});
                channelinfo.low = block_height;
                channelinfo.currentBlockHash = block.header.data_hash;
                channelinfo.previousBlockHash = block.header.previous_hash;
                /*
                var first_tx = block.data.data[0]; // get the first transaction
                var header = first_tx.payload.header; // the "header" object contains metadata of the transaction
                var channel_id = header.channel_header.channel_id;
                if (g_options.channel_id !== channel_id) return;
                */
            },
            (err) => {
                logger.error("[cc_api] Block event error.")
            }
        );
        eventHub.registerChaincodeEvent(g_options.chaincode_id, CusRequestIndex,
            (eventObj) => {
                var payload = eventObj.payload;
                logger.info("[cc_api] Chaincode event with payload:",payload);
            },
            (err) => {
                logger.error("[cc_api] Chaincode event error.");
            });
        creditcheck_cc.eventHub=eventHub;
    };

    creditcheck_cc.closeEventHub=function () {
        creditcheck_cc.eventHub.disconnect();
    }



    return  creditcheck_cc;
}