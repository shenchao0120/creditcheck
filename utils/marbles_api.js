/**
 * Created by wuweiwei on 2017/9/22.
 */

module.exports = function (fcw, helper, logger) {
    var path = require('path');
// --- Set Our Things --- //
    var marbles_api={}
    marbles_api.enrollObj={}

    marbles_api.enroll_admin=function (attempt, cb) {
        fcw.enroll(helper.makeEnrollmentOptions(0), function (errCode, obj) {
            if (errCode != null) {
                logger.error('Enroll error ' + attempt + ' times');
                if (attempt >= 2) {
                    if (cb) {
                        cb(errCode);
                    }
                }
                else {
                    enroll_admin(++attempt, cb);
                }
            }
            else {
                logger.info('Enrolled success');
                if (cb) {
                    marbles_api.enrollObj=obj;
                    cb(null, obj);
                }
            }
        });
    };


    marbles_api.read_everything=function () {
        const channel=helper.getChannelId();
        const first_peer=helper.getFirstPeerName(channel);

        var options= {
            peer_urls:[helper.getPeersUrl(first_peer)],
        };
        var opts = helper.makeMarblesLibOptions();

        var marbles_lib = require(path.join(__dirname, './marbles_cc_lib.js'))(marbles_api.enrollObj, opts, fcw, logger);
        marbles_lib.read_everything(options,function (err, resp) {
            if (err != null) {
                console.log('');
                logger.debug('[checking] could not get everything:', err);
                /*
                var obj = {
                    msg: 'error',
                    e: err,
                };
                if (ws_client) ws_client.send(JSON.stringify(obj)); 								//send to a client
                else broadcast(obj);																//send to all clients
                if (cb) cb();
                */
            }
            else {
                var data = resp.parsed;
                if (data && data.owners && data.marbles) {
                    console.log('');
                    logger.debug('[checking] number of owners:', data.owners.length);
                    logger.debug('[checking] number of marbles:', data.marbles.length);
                }
                console.log("The result:",data)
                /*

                data.owners = organize_usernames(data.owners);
                data.marbles = organize_marbles(data.marbles);
                var knownAsString = JSON.stringify(known_everything);			//stringify for easy comparison (order should stay the same)
                var latestListAsString = JSON.stringify(data);

                if (knownAsString === latestListAsString) {
                    logger.debug('[checking] same everything as last time');
                    if (ws_client !== null) {									//if this is answering a clients req, send to 1 client
                        logger.debug('[checking] sending to 1 client');
                        ws_client.send(JSON.stringify({ msg: 'everything', e: err, everything: data }));
                    }
                }
                else {															//detected new things, send it out
                    logger.debug('[checking] there are new things, sending to all clients');
                    known_everything = data;
                    broadcast({ msg: 'everything', e: err, everything: data });	//sent to all clients
                }
                if (cb) cb();
                */
            }
        });

    }
    return  marbles_api;

    // organize the marble owner list
    function organize_usernames(data) {
        var ownerList = [];
        var myUsers = [];
        for (var i in data) {						//lets reformat it a bit, only need 1 peer's response
            var temp = {
                id: data[i].id,
                username: data[i].username,
                company: data[i].company
            };
            if (temp.company === process.env.marble_company) {
                myUsers.push(temp);					//these are my companies users
            }
            else {
                ownerList.push(temp);				//everyone else
            }
        }

        ownerList = sort_usernames(ownerList);
        ownerList = myUsers.concat(ownerList);		//my users are first, bring in the others
        return ownerList;
    }

    //
    function organize_marbles(allMarbles) {
        var ret = {};
        for (var i in allMarbles) {
            if (!ret[allMarbles[i].owner.username]) {
                ret[allMarbles[i].owner.username] = {
                    owner_id: allMarbles[i].owner.id,
                    username: allMarbles[i].owner.username,
                    company: allMarbles[i].owner.company,
                    marbles: []
                };
            }
            ret[allMarbles[i].owner.username].marbles.push(allMarbles[i]);
        }
        return ret;
    }

    // alpha sort everyone else
    function sort_usernames(temp) {
        temp.sort(function (a, b) {
            var entryA = a.company + a.username;
            var entryB = b.company + b.username;
            if (entryA < entryB) return -1;
            if (entryA > entryB) return 1;
            return 0;
        });
        return temp;
    }


}

