/**
 * Created by wuweiwei on 2017/11/22.
 */


var winston = require('winston');								//logger module
var path = require('path');
var logger = new (winston.Logger)({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({ colorize: true }),
    ]
});

// --- Set Details Here --- //
var config_file = 'marbles_local.json';							//set config file name
var chaincode_id = 'creditcheck';									//set desired chaincode id to identify this chaincode
var chaincode_ver = 'v0';										//set desired chaincode version

//  --- Use (optional) arguments if passed in --- //
var args = process.argv.slice(2);
if (args[0]) {
    config_file = args[0];
    logger.debug('Using argument for config file', config_file);
}
if (args[1]) {
    chaincode_id = args[1];
    logger.debug('Using argument for chaincode id');
}
if (args[2]) {
    chaincode_ver = args[2];
    logger.debug('Using argument for chaincode version');
}

//var configer=require(__dirname+'/../utils/cfg_loader.js')('blockchain_creds_local.json',logger);

var configer=require(__dirname+'/../utils/cc_cfg_loader.js')('blockchain_creds_local.json',process.env.creds_filename,logger);

//var helper = require(path.join(__dirname, '../utils/helper.js'))(config_file, logger);			//set the config file name here
var fcw = require(path.join(__dirname, '../utils/fc_wrapper/index.js'))({ block_delay: configer.getBlockDelay() }, logger);

console.log('---------------------------------------');
logger.info('Lets install some chaincode -', chaincode_id, chaincode_ver);
console.log('---------------------------------------');

logger.info('First we enroll');
fcw.enrollWithAdminCert(configer.makeEnrollmentOptionsUsingCert(), function (enrollErr, enrollResp) {
    if (enrollErr != null) {
        logger.error('error enrolling', enrollErr, enrollResp);
    } else {
        console.log('---------------------------------------');
        logger.info('Now we install');
        console.log('---------------------------------------');

        const channel = configer.getChannelId();
        const first_peer = configer.getFirstPeerName(channel);
        var opts = {
            peer_urls: [configer.getPeersUrl(first_peer)],
            chaincode_id: chaincode_id,
            chaincode_version: chaincode_ver,
            cc_args: [''],
            peer_tls_opts: configer.getPeerTlsCertOpts(first_peer)
        };
        fcw.instantiate_chaincode(enrollResp, opts, function (err, resp) {
            console.log('---------------------------------------');
            logger.info('Install done. Errors:', (!err) ? 'nope' : err);
            console.log('---------------------------------------');
        });
    }
});




