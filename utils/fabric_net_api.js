/**
 * Created by wuweiwei on 2017/10/25.
 */

module.exports = function (fcw, configer, logger) {
    var path = require('path');
// --- Set Our Things --- //
    var fabric_net_api = {}
    fabric_net_api.enrollObj = {}

    fabric_net_api.enroll_admin = function (attempt, cb) {
        fcw.enroll(configer.makeEnrollmentOptions(0), function (errCode, obj) {
            if (errCode != null) {
                logger.error('Enroll error ' + attempt + ' times');
                if (attempt >= 2) {
                    if (cb) {
                        cb(errCode);
                    }
                }
                else {
                    fabric_net_api.enroll_admin(++attempt, cb);
                }
            }
            else {
                logger.info('Enrolled success');
                if (cb) {
                    fabric_net_api.enrollObj = obj;
                    cb(null, obj);
                }
            }
        });
    };
    return fabric_net_api;
};