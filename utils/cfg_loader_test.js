/**
 * Created by wuweiwei on 2017/10/24.
 */


var winston=require('winston')

var path=require('path')

var logger = new (winston.Logger)({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({ colorize: true }),
    ]
});

var loader =require('./cfg_loader.js')('blockchain_creds_tls.json',logger)

console.log('getChannelId:',loader.getChannelId());

console.log('getFirstPeerName:',loader.getFirstPeerName(loader.getChannelId()));

console.log(loader.getAllPeerUrls('mychannel'));

console.log(loader.getFirstOrdererName('mychannel'));

console.log(loader.getOrderersUrl('fabric-orderer-12297b'));
console.log(loader.getOrdererTlsCertOpts('fabric-orderer-12297b'));

console.log(loader.checkConfig());

console.log('getChaincodeId:'+loader.getChaincodeId());

require('./cc_cfg_loader.js')(loader,'marbles_local.json',logger);


console.log(loader.getMarbleUsernames())




