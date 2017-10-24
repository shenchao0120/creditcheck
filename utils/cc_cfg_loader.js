/**
 * Created by wuweiwei on 2017/10/24.
 */

var fs = require('fs');
var path = require('path');
var os = require('os');


module.exports = function (loader,config_filename, logger) {
    if(!config_filename){
        config_filename='marbles_local.json';
    }
    loader.config_path = path.join(__dirname, '../config/' + config_filename);
    loader.config = require(loader.config_path);

    // --------------------------------------------------------------------------------
    // Config Getters
    // --------------------------------------------------------------------------------
    // get the marble owner names
    loader.getMarbleUsernames = function () {
        return getMarblesField('usernames');
    };

    // get the marbles trading company name
    loader.getCompanyName = function () {
        return getMarblesField('company');
    };

    // get the marble's server port number
    loader.getMarblesPort = function () {
        return getMarblesField('port');
    };

    // get the status of marbles previous startup
    loader.getEventsSetting = function () {
        if (loader.config['use_events']) {
            return loader.config['use_events'];
        }
        return false;
    };

    // get the re-enrollment period in seconds
    loader.getKeepAliveMs = function () {
        var sec = getMarblesField('keep_alive_secs');
        if (!sec) sec = 30;									//default to 30 seconds
        return (sec * 1000);
    };

    // safely retrieve marbles fields
    function getMarblesField(marbles_field) {
        try {
            if (loader.config[marbles_field]) {
                return loader.config[marbles_field];
            }
            else {
                logger.warn('"' + marbles_field + '" not found in config json: ' + loader.config_path);
                return null;
            }
        }
        catch (e) {
            logger.warn('"' + marbles_field + '" not found in config json: ' + loader.config_path);
            return null;
        }
    }


    // --------------------------------------------------------------------------------
    // Build Options
    // --------------------------------------------------------------------------------
    loader.makeUniqueId = function () {
        const channel = loader.getChannelId();
        const first_peer = loader.getFirstPeerName(channel);
        return 'marbles-' + loader.getNetworkName() + '-' + channel + '-' + first_peer;
    };

    // build the marbles lib module options
    loader.makeMarblesLibOptions = function () {
        const channel = loader.getChannelId();
        const first_org = loader.getFirstOrg();
        const first_ca = loader.getFirstCaName(first_org);
        const first_peer = loader.getFirstPeerName(channel);
        const first_orderer = loader.getFirstOrdererName(channel);
        return {
            block_delay: loader.getBlockDelay(),
            channel_id: loader.getChannelId(),
            chaincode_id: loader.getChaincodeId(),
            event_url: (loader.getEventsSetting()) ? loader.getPeerEventUrl(first_peer) : null,
            chaincode_version: loader.getChaincodeVersion(),
            ca_tls_opts: loader.getCaTlsCertOpts(first_ca),
            orderer_tls_opts: loader.getOrdererTlsCertOpts(first_orderer),
            peer_tls_opts: loader.getPeerTlsCertOpts(first_peer),
            peer_urls: loader.getAllPeerUrls(channel),
        };
    };


    return loader;
}