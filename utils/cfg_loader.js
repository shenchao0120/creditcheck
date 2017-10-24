/**
 * Created by wuweiwei on 2017/10/24.
 */

var fs = require('fs');
var path = require('path');
var os = require('os');

module.exports = function (config_filename, logger) {
    var loader={};
    if(!config_filename){
        config_filename='blockchain_creds_tls.json';
    }
    loader.creds_path = path.join(__dirname, '../config/' + config_filename);
    loader.creds=require(loader.creds_path);
    logger.info('Loaded creds file', loader.creds_path);

    loader.getNetworkName = function () {
        return loader.creds.name;
    };


    // --------------------------------------------------------------------------------
    // Peer Getters
    // --------------------------------------------------------------------------------
    // find the first ca in the peers field for this org
    loader.getFirstPeerName = function (ch) {
        const channel = loader.creds.channels[ch];
        if (channel && channel.peers) {
            const peers = Object.keys(channel.peers);
            if (peers && peers[0]) {
                return peers[0];
            }
        }
        throw new Error('Peer not found for this channel', ch);
    };

    // get a peer object
    loader.getPeer = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Peer key not passed');
        }
        else {
            if (loader.creds.peers) {
                return loader.creds.peers[key];
            }
            else {
                return null;
            }
        }
    };

    // get a peer's grpc url
    loader.getPeersUrl = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Peer key not passed');
        }
        else {
            let peer = loader.getPeer(key);
            if (peer) {
                return peer.url;
            }
            else {
                throw new Error('Peer key not found.');
            }
        }
    };

    // get all peers grpc urls and event urls, on this channel
    loader.getAllPeerUrls = function (channelId) {
        let ret = {
            urls: [],
            eventUrls: []
        };
        if (loader.creds.channels && loader.creds.channels[channelId]) {
            for (let peerId in loader.creds.channels[channelId].peers) {	//iter on the peers on this channel
                ret.urls.push(loader.creds.peers[peerId].url);				//get the grpc url for this peer
                ret.eventUrls.push(loader.creds.peers[peerId].eventUrl);	//get the grpc EVENT url for this peer
            }
        }
        return ret;
    };

    // get a peer's grpc event url
    loader.getPeerEventUrl = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Peer key not passed');
        } else {
            let peer = loader.getPeer(key);
            if (peer) {
                return peer.eventUrl;
            }
            else {
                throw new Error('Peer key not found.');
            }
        }
    };

    // get a peer's tls options
    loader.getPeerTlsCertOpts = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Peer\'s key not passed');
        } else {
            let peer = loader.getPeer(key);
            return buildTlsOpts(peer);
        }
    };


    // --------------------------------------------------------------------------------
    // Certificate Authorities Getters
    // --------------------------------------------------------------------------------
    // find the first ca in the certificateAuthorities field for this org
    loader.getFirstCaName = function (orgName) {
        const org = loader.creds.organizations[orgName];
        if (org && org.certificateAuthorities) {
            if (org.certificateAuthorities && org.certificateAuthorities[0]) {
                return org.certificateAuthorities[0];
            }
        }
        throw new Error('CAs not found.');
    };

    // get a ca obj
    loader.getCA = function (key) {
        if (key === undefined || key == null) {
            throw new Error('CA key not passed');
        } else {
            if (loader.creds.certificateAuthorities) {
                return loader.creds.certificateAuthorities[key];
            } else {
                return null;
            }
        }
    };

    // get a ca's http url
    loader.getCasUrl = function (key) {
        if (key === undefined || key == null) {
            throw new Error('CA key not passed');
        } else {
            let ca = loader.getCA(key);
            if (ca) {
                return ca.url;
            }
            else {
                throw new Error('CA not found.');
            }
        }
    };

    // get all the ca http urls
    loader.getAllCaUrls = function () {
        let ret = [];
        for (let id in loader.creds.certificateAuthorities) {
            ret.push(loader.creds.certificateAuthorities[id].url);
        }
        return ret;
    };

    // get a ca's name, could be null
    loader.getCaName = function (key) {
        if (key === undefined || key == null) {
            throw new Error('CA key not passed');
        } else {
            let ca = loader.getCA(key);
            if (ca) {
                return ca.caName;
            }
            else {
                throw new Error('CA not found.');
            }
        }
    };

    // get a ca's tls options
    loader.getCaTlsCertOpts = function (key) {
        if (key === undefined || key == null) {
            throw new Error('CAs key not passed');
        } else {
            let ca = loader.getCA(key);
            return buildTlsOpts(ca);
        }
    };

    // get an enrollment user
    loader.getEnrollObj = function (caKey, user_index) {
        if (caKey === undefined || caKey == null) {
            throw new Error('CA key not passed');
        } else {
            var ca = loader.getCA(caKey);
            if (ca && ca.registrar && ca.registrar[user_index]) {
                return ca.registrar[user_index];
            }
            else {
                throw new Error('Cannot find enroll id at index.', caKey, user_index);
            }
        }
    };

    // --------------------------------------------------------------------------------
    // Orderer Getters
    // --------------------------------------------------------------------------------
    // get the first orderer in the channels field
    loader.getFirstOrdererName = function (ch) {
        const channel = loader.creds.channels[ch];
        if (channel && channel.orderers && channel.orderers[0]) {
            return channel.orderers[0];
        }
        throw new Error('Orderer not found for this channel', ch);
    };

    // get an orderer object
    loader.getOrderer = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Orderers key not passed');
        } else {
            if (loader.creds.orderers) {
                return loader.creds.orderers[key];
            } else {
                return null;
            }
        }
    };

    // get an orderer's grpc url
    loader.getOrderersUrl = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Orderers key not passed');
        } else {
            let orderer = loader.getOrderer(key);
            if (orderer) {
                return orderer.url;
            }
            else {
                throw new Error('Orderer not found.');
            }
        }
    };

    // get a orderer's tls options
    loader.getOrdererTlsCertOpts = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Orderer\'s key not passed');
        } else {
            let orderer = loader.getOrderer(key);
            return buildTlsOpts(orderer);
        }
    };


    // --------------------------------------------------------------------------------
    // Other Credential Getters
    // --------------------------------------------------------------------------------
    // build the tls options for the sdk
    function buildTlsOpts(node_obj) {
        let ret = {
            'ssl-target-name-override': null,
            pem: null,
            'grpc.http2.keepalive_time': 300,					//grpc 1.2.4
            'grpc.keepalive_time_ms': 300000,					//grpc 1.3.7
            'grpc.http2.keepalive_timeout': 35,					//grpc 1.2.4
            'grpc.keepalive_timeout_ms': 3500,					//grpc 1.3.7
        };
        if (node_obj) {
            if (node_obj.tlsCACerts) {
                ret.pem = loadPem(node_obj.tlsCACerts);
            }
            if (node_obj.grpcOptions) {
                for (var field in ret) {
                    if (node_obj.grpcOptions[field]) {
                        ret[field] = node_obj.grpcOptions[field];
                    }
                }
            }
        }
        return ret;
    }


    // find the first org name in the organization field
    loader.getFirstOrg = function () {
        if (loader.creds.organizations) {
            const orgs = Object.keys(loader.creds.organizations);
            if (orgs && orgs[0]) {
                return orgs[0];
            }
        }
        throw new Error('Orgs not found.');
    };

    // find the org name in the client field
    loader.getClientOrg = function () {
        if (loader.creds.client && loader.creds.client.organization) {
            return loader.creds.client.organization;
        }
        throw new Error('Org not found.');
    };

    // get this org's msp id
    loader.getOrgsMSPid = function (key) {
        if (key === undefined || key == null) {
            throw new Error('Org key not passed');
        }
        else {
            if (loader.creds.organizations && loader.creds.organizations[key]) {
                return loader.creds.organizations[key].mspid;
            }
            else {
                throw new Error('Org key not found.', key);
            }
        }
    };

    // get an admin private key PEM certificate
    loader.getAdminPrivateKeyPEM = function (orgName) {
        if (orgName && loader.creds.organizations && loader.creds.organizations[orgName]) {
            if (!loader.creds.organizations[orgName].adminPrivateKey) {
                throw new Error('Admin private key is not found in the creds json file: ' + orgName);
            } else {
                return loadPem(loader.creds.organizations[orgName].adminPrivateKey);
            }
        }
        else {
            throw new Error('Cannot find org.', orgName);
        }
    };

    // get an admin's signed cert PEM
    loader.getAdminSignedCertPEM = function (orgName) {
        if (orgName && loader.creds.organizations && loader.creds.organizations[orgName]) {
            if (!loader.creds.organizations[orgName].signedCert) {
                throw new Error('Admin certificate is not found in the creds json file: ' + orgName);
            } else {
                return loadPem(loader.creds.organizations[orgName].signedCert);
            }
        }
        else {
            throw new Error('Cannot find org.', orgName);
        }
        return null;
    };

    // load cert from file path OR just pass cert back
    function loadPem(obj) {
        if (obj && obj.path) {											// looks like field is a path to a file
            var path2cert = path.join(__dirname, '../config/' + obj.path);
            return fs.readFileSync(path2cert, 'utf8') + '\r\n'; 		//read from file, LOOKING IN config FOLDER
        } else {
            return obj.pem;												//can be null if network is not using TLS
        }
        return null;
    }

    // get the channel id on network for marbles
    loader.getChannelId = function () {
        if (loader.creds && loader.creds.channels) {
            var channels = Object.keys(loader.creds.channels);
            if (channels[0]) {
                return channels[0];
            }
        }
        throw Error('No channels found in credentials file...');
    };

    // get the chaincode id on network
    loader.getChaincodeId = function () {
        var channel = loader.getChannelId();
        if (channel && loader.creds.channels[channel] && loader.creds.channels[channel].chaincodes) {
            var chaincode = Object.keys(loader.creds.channels[channel].chaincodes);
            return chaincode[0];
        }
        logger.warn('No chaincode ID found in credentials file... might be okay if we haven\'t instantiated marbles yet');
        return null;
    };

    // get the chaincode version on network
    loader.getChaincodeVersion = function () {
        var channel = loader.getChannelId();
        var chaincodeId = loader.getChaincodeId();
        if (channel && chaincodeId) {
            return loader.creds.channels[channel].chaincodes[chaincodeId];
        }
        logger.warn('No chaincode version found in credentials file... might be okay if we haven\'t instantiated marbles yet');
        return null;
    };

    // get the chaincode id on network
    loader.getBlockDelay = function () {
        let ret = 1000;
        var channel = loader.getChannelId();
        if (loader.creds.channels && loader.creds.channels[channel] && loader.creds.channels[channel]['x-blockDelay']) {
            if (!isNaN(loader.creds.channels[channel]['x-blockDelay'])) {
                ret = loader.creds.channels[channel]['x-blockDelay'];
            }
        }
        return ret;
    };

    // get key value store location
    loader.getKvsPath = function (opts) {
        const id = loader.makeUniqueId();
        const default_path = path.join(os.homedir(), '.hfc-key-store/', id);

        if (opts && opts.going2delete) {							//if this is for a delete, return default so we don't wipe a kvs someone setup
            return default_path;									//do the default one
        }

        // -- Using Custom KVS -- //
        if (loader.creds.client && loader.creds.client.credentialStore) {
            const kvs_path = loader.creds.client.credentialStore.path;
            const ret = path.join(__dirname, '../config/' + kvs_path + '/');
            copy_keys_over(ret);
            return ret;												//use the kvs provided in the json
        } else {
            return default_path;									//make a new kvs folder in the home dir
        }

        // copy over private and public keys to the hfc key value store
        function copy_keys_over(custom_path) {
            try {
                const default_path2 = path.join(os.homedir(), '.hfc-key-store/');
                const private_key = 'cd96d5260ad4757551ed4a5a991e62130f8008a0bf996e4e4b84cd097a747fec-priv';	//todo make this generic
                const public_key = 'cd96d5260ad4757551ed4a5a991e62130f8008a0bf996e4e4b84cd097a747fec-pub';
                fs.createReadStream(custom_path + private_key).pipe(fs.createWriteStream(default_path2 + private_key));
                fs.createReadStream(custom_path + public_key).pipe(fs.createWriteStream(default_path2 + public_key));
            } catch (e) { }
        }
    };


    // build the enrollment options for using an enroll ID
    loader.makeEnrollmentOptions = function (userIndex) {
        if (userIndex === undefined || userIndex == null) {
            throw new Error('User index not passed');
        } else {
            const channel = loader.getChannelId();
            const org_2_use = loader.getClientOrg();
            const first_ca = loader.getFirstCaName(org_2_use);
            const first_peer = loader.getFirstPeerName(channel);
            const first_orderer = loader.getFirstOrdererName(channel);
            const org_name = loader.getOrgsMSPid(org_2_use);				//lets use the first org we find
            const user_obj = loader.getEnrollObj(first_ca, userIndex);		//there may be multiple users
            return {
                channel_id: channel,
                uuid: loader.makeUniqueId(),
                ca_urls: loader.getAllCaUrls(),
                ca_name: loader.getCaName(first_ca),
                orderer_url: loader.getOrderersUrl(first_orderer),
                peer_urls: [loader.getPeersUrl(first_peer)],
                enroll_id: user_obj.enrollId,
                enroll_secret: user_obj.enrollSecret,
                msp_id: org_name,
                ca_tls_opts: loader.getCaTlsCertOpts(first_ca),
                orderer_tls_opts: loader.getOrdererTlsCertOpts(first_orderer),
                peer_tls_opts: loader.getPeerTlsCertOpts(first_peer),
                kvs_path: loader.getKvsPath()
            };
        }
    };

    // build the enrollment options using an admin cert
    loader.makeEnrollmentOptionsUsingCert = function () {
        const channel = loader.getChannelId();
        const org_2_use = loader.getClientOrg();
        const first_peer = loader.getFirstPeerName(channel);
        const first_orderer = loader.getFirstOrdererName(channel);
        const org_name = loader.getOrgsMSPid(org_2_use);		//lets use the first org we find
        return {
            channel_id: channel,
            uuid: loader.makeUniqueId(),
            orderer_url: loader.getOrderersUrl(first_orderer),
            peer_urls: [loader.getPeersUrl(first_peer)],
            msp_id: org_name,
            privateKeyPEM: loader.getAdminPrivateKeyPEM(org_name),
            signedCertPEM: loader.getAdminSignedCertPEM(org_name),
            orderer_tls_opts: loader.getOrdererTlsCertOpts(first_orderer),
            peer_tls_opts: loader.getPeerTlsCertOpts(first_peer),
            kvs_path: loader.getKvsPath()
        };
    };

    // write new settings
    loader.write = function (obj) {
        console.log('saving the creds file has been disabled temporarily');

        const channel = loader.getChannelId();
        const org_2_use = loader.getClientOrg();
        const first_peer = loader.getFirstPeerName(channel);
        const first_ca = loader.getFirstCaName(org_2_use);
        const first_orderer = loader.getFirstOrdererName(channel);

        //var config_file = JSON.parse(fs.readFileSync(loader.config_path, 'utf8'));
        var creds_file = JSON.parse(fs.readFileSync(loader.creds_path, 'utf8'));

        if (obj.ordererUrl) {
            creds_file.orderers[first_orderer].url = obj.ordererUrl;
        }
        if (obj.peerUrl) {
            creds_file.peers[first_peer].url = obj.peerUrl;
        }
        if (obj.caUrl) {
            creds_file.certificateAuthorities[first_ca].url = obj.caUrl;
        }
        if (obj.chaincodeId) {
            const version = loader.getChaincodeVersion();
            creds_file.channels[channel].chaincodes = {};
            creds_file.channels[channel].chaincodes[obj.chaincodeId] = version;
        }
        if (obj.chaincodeVersion) {
            creds_file.channels[channel].chaincodes[loader.getChaincodeId()] = obj.chaincodeVersion;
        }
        if (obj.channelId) {
            const old_channel_obj = JSON.parse(JSON.stringify(creds_file.channels[channel]));
            creds_file.channels = {};
            creds_file.channels[obj.channelId] = old_channel_obj;
        }
        if (obj.enrollId && obj.enrollSecret) {
            creds_file.certificateAuthorities[first_ca].registrar[0] = {
                enrollId: obj.enrollId,
                enrollSecret: obj.enrollSecret
            };
        }

        fs.writeFileSync(loader.creds_path, JSON.stringify(creds_file, null, 4), 'utf8');	//save to file
        loader.creds = creds_file;													//replace old copy
    };


    // --------------------------------------------------------------------------------
    // Input Checking
    // --------------------------------------------------------------------------------
    // check if user has changed the settings from the default ones - returns error array when there is a problem
    loader.checkConfig = function () {
        let errors = [];
        if (loader.getNetworkName() === 'Place Holder Network Name') {
            console.log('\n');
            logger.warn('----------------------------------------------------------------------');
            logger.warn('----------------------------- Hey Buddy! -----------------------------');
            logger.warn('------------------------- It looks like you --------------------------');
            logger.error('----------------------------- skipped -------------------------------');
            logger.warn('------------------------- some instructions --------------------------');
            logger.warn('----------------------------------------------------------------------');
            logger.warn('Your network config JSON has a network name of "Place Holder Network Name"...');
            logger.warn('I\'m afraid you cannot use the default settings as is.');
            logger.warn('These settings must be edited to point to YOUR network.');
            logger.warn('----------------------------------------------------------------------');
            logger.error('Fix this file: ./config/' + config_filename);
            logger.warn('It must have credentials/hostnames/ports/channels/etc for YOUR network');
            logger.warn('How/where would I get that info? Are you using the Bluemix service? Then look at these instructions(near the end): ');
            logger.warn('https://github.com/IBM-Blockchain/marbles/blob/v4.0/docs/install_chaincode.md');
            logger.warn('----------------------------------------------------------------------');
            console.log('\n\n');
            errors.push('Using default values');
            return errors;
        }
        return loader.check_for_missing();					//run the next check
    };

    // check if marbles UI and marbles chaincode work together
    loader.errorWithVersions = function (v) {
        var version = package_json.version;
        if (!v || !v.parsed) v = { parsed: '0.x.x' };		//default
        if (v.parsed[0] !== version[0]) {					//only check the major version
            console.log('\n');
            logger.warn('---------------------------------------------------------------');
            logger.warn('----------------------------- Ah! -----------------------------');
            logger.warn('---------------------------------------------------------------');
            logger.error('Looks like you are using an old version of marbles chaincode...');
            logger.warn('The INTERNAL version of the chaincode found is: v' + v.parsed);
            logger.warn('But this UI is expecting INTERNAL chaincode version: v' + version[0] + '.x.x');
            logger.warn('This mismatch won\'t work =(');
            logger.warn('Install and instantiate the chaincode found in the ./chaincode folder on your channel ' + loader.getChannelId());
            logger.warn('----------------------------------------------------------------------');
            console.log('\n\n');
            return true;
        }
        return false;
    };

    // check if config has missing entries
    loader.check_for_missing = function () {
        let errors = [];
        const channel = loader.getChannelId();

        if (!channel) {
            errors.push('There is no channel data in the "channels" field');
        } else {
            const org_2_use = loader.getClientOrg();
            const first_ca = loader.getFirstCaName(org_2_use);
            const first_orderer = loader.getFirstOrdererName(channel);
            const first_peer = loader.getFirstPeerName(channel);

            if (!loader.getCA(first_ca)) {
                errors.push('There is no CA data in the "certificateAuthorities" field');
            }
            if (!loader.getOrderer(first_orderer)) {
                errors.push('There is no Orderer data in the "orderers" field');
            }
            if (!loader.getPeer(first_peer)) {
                errors.push('There is no Peer data in the "peers" field');
            }
        }

        if (errors.length > 0) {
            console.log('\n');
            logger.warn('----------------------------------------------------------------------');
            logger.warn('------------------------------- Whoops -------------------------------');
            logger.warn('----------- You are missing some data in your creds file -------------');
            logger.warn('----------------------------------------------------------------------');
            for (var i in errors) {
                logger.error(errors[i]);
            }
            logger.warn('----------------------------------------------------------------------');
            logger.error('Fix this file: ./config/' + loader.getNetworkCredFileName());
            logger.warn('----------------------------------------------------------------------');
            logger.warn('See this file for help:');
            logger.warn('https://github.com/IBM-Blockchain/marbles/blob/v4.0/docs/config_file.md');
            logger.warn('----------------------------------------------------------------------');
            console.log('\n\n');
            return errors;
        }
        return loader.check_protocols();					//run the next check
    };

    // check if config has protocol errors - returns error array when there is a problem
    loader.check_protocols = function () {
        let errors = [];
        const channel = loader.getChannelId();
        const org_2_use = loader.getClientOrg();
        const first_ca = loader.getFirstCaName(org_2_use);
        const first_orderer = loader.getFirstOrdererName(channel);
        const first_peer = loader.getFirstPeerName(channel);

        if (loader.getCasUrl(first_ca).indexOf('grpc') >= 0) {
            errors.push('You accidentally typed "grpc" in your CA url. It should be "http://" or "https://"');
        }
        if (loader.getOrderersUrl(first_orderer).indexOf('http') >= 0) {
            errors.push('You accidentally typed "http" in your Orderer url. It should be "grpc://" or "grpcs://"');
        }
        if (loader.getPeersUrl(first_peer).indexOf('http') >= 0) {
            errors.push('You accidentally typed "http" in your Peer discovery url. It should be "grpc://" or "grpcs://"');
        }
        if (loader.getPeerEventUrl(first_peer).indexOf('http') >= 0) {
            errors.push('You accidentally typed "http" in your Peer events url. It should be "grpc://" or "grpcs://"');
        }

        if (errors.length > 0) {
            console.log('\n');
            logger.warn('----------------------------------------------------------------------');
            logger.warn('------------------------ Close but no cigar --------------------------');
            logger.warn('---------------- You have at least one protocol typo -----------------');
            logger.warn('----------------------------------------------------------------------');
            for (var i in errors) {
                logger.error(errors[i]);
            }
            logger.warn('----------------------------------------------------------------------');
            logger.error('Fix this file: ./config/' + loader.getNetworkCredFileName());
            logger.warn('----------------------------------------------------------------------');
            logger.warn('See this file for help:');
            logger.warn('https://github.com/IBM-Blockchain/marbles/blob/v4.0/docs/config_file.md');
            logger.warn('----------------------------------------------------------------------');
            console.log('\n\n');
            return errors;
        }
        return null;
    };

    return loader;
};

