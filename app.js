'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Cookies = require('cookies');                // cookies模块


var app = express();

var cors = require('cors');
var async = require('async');
var ws = require('ws');											//websocket module
var winston = require('winston');

// --- Get Our Modules --- //
var logger = new (winston.Logger)({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({ colorize: true }),
    ]
});

process.env.creds_filename='marbles_local.json';

//var configer=require(__dirname+'/utils/cfg_loader.js')('blockchain_creds_local.json',logger);

var configer=require(__dirname+'/utils/cc_cfg_loader.js')('blockchain_creds_local.json',process.env.creds_filename,logger);

var fcw=require(__dirname+'/utils/fc_wrapper/index.js')({ block_delay: configer.getBlockDelay() }, logger);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));

app.options('*', cors());
app.use(cors());


var sqlServices=require(__dirname+'/db/sqlutils.js')(configer,logger);

app.sqlServices=sqlServices;
app.logger=logger;

//验证是否已经登录

app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {}
    //console.log('userinfo'+req.cookies.get('userInfo'));
    if  (req.cookies.get('userInfo') &&req.cookies.get('userInfo').length!=0) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // 获取当前登录用户类型,是不是管理员
            sqlServices.isUserExisted(req.userInfo.user_id).then((obj)=>{
                req.userInfo.isAdmin=obj.user_type=='0'?true:false;
                req.userInfo.username=obj.user_loginName;
                req.userInfo.isLogin=true;
                next();
            })
        } catch (e) {
            next();
        }
    } else {
        next();
    }
});



// 路由设置

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.use('/inner', require('./routes/innerinfo'));

app.use('/chain', require('./routes/chainOperation'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

logger.info("test the logger");


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('404');
});

let config_error = configer.checkConfig();

// ============================================================================================================================
// 								Default http server manipulation
// ============================================================================================================================
var debug = require('debug')('creditcheck:server');
var http = require('http');
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
/**
 * Create HTTP server.
 */
var server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    logger.info('Listening on ' + bind);
}


// ============================================================================================================================
// 														Launch Webserver
// ============================================================================================================================

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_ENV = 'debug';
server.timeout = 240000;																							// Ta-da.
var host='localhost';

console.log('\n');
console.log('----------------------------------- Server Up - ' + host + ':' + port + ' -----------------------------------');
process.on('uncaughtException', function (err) {
    logger.error('Caught exception: ', err.stack);		//demos never give up
    if (err.stack.indexOf('EADDRINUSE') >= 0) {			//except for this error
        logger.warn('---------------------------------------------------------------');
        logger.warn('----------------------------- Ah! -----------------------------');
        logger.warn('---------------------------------------------------------------');
        logger.error('You already have something running on port ' + port + '!');
        logger.error('Kill whatever is running on that port OR change the port setting in your  config file: ' + configer.config_path);
        process.exit();
    }
});


// ============================================================================================================================
// 														Work Area
// ============================================================================================================================

// ----------------------------------------------------------------------------------------------------------------------------
// Life Starts Here!
// ----------------------------------------------------------------------------------------------------------------------------

setupWebSocket();

setupChannelApis();





// ============================================================================================================================
// 												WebSocket Communication Setup
// ============================================================================================================================
function setupWebSocket() {
    logger.info('------------------------------------------ Websocket Up ------------------------------------------');
    var wss = new ws.Server({ server: server });								//start the websocket now
    wss.on('connection', function connection(ws) {
        logger.debug('[ws] received ws connect');
        ws.on('message', function incoming(message) {
            console.log(' ');
            console.log('-------------------------------- Incoming WS Msg --------------------------------');
            logger.debug('[ws] received ws msg:', message);
            var data = null;
            try {
                data = JSON.parse(message);
            }
            catch (e) {
                logger.debug('[ws] message error', message, e.stack);
            }
            if (data && data.type == 'setup') {
                logger.debug('[ws] setup message', data);


            }
            else if (data) {
                logger.debug('[ws]  message', data);
            }
            wss.broadcast(build_state_msg())

        });

        ws.on('error', function (e) { logger.debug('[ws] error', e); });
        ws.on('close', function () { logger.debug('[ws] closed'); });
        ws.send(JSON.stringify(build_state_msg()));							//tell client our app state
    });
    wss.broadcast = function broadcast(data) {
        var i = 0;
        wss.clients.forEach(function each(client) {
            try {
                logger.debug('[ws] broadcasting to clients. ', (++i), data.msg);
                client.send(JSON.stringify(data));
            }
            catch (e) {
                logger.debug('[ws] error broadcast ws', e);
            }
        });
    };

    wss.broadcastMsg = function broadcast(msg,state,payload) {
        var data={
            msg:msg,
            state:state,
            payload:payload
        };
        var i = 0;
        wss.clients.forEach(function each(client) {
            try {
                logger.debug('[ws] broadcasting to clients. ', (++i), data.msg);
                client.send(JSON.stringify(data));
            }
            catch (e) {
                logger.debug('[ws] error broadcast ws', e);
            }
        });
    };
    app.wss=wss;

}

// Message to client to communicate where we are in the start up
function build_state_msg() {
    return {
        msg: 'app_state',
        state: 'test_state',
        first_setup: true
    };
}



// ============================================================================================================================
// 												Event-Hub Listener Setup
// ============================================================================================================================



function setupChannelApis() {
    var fabricNet=require(__dirname+'/utils/fabric_net_api.js')(fcw,configer,logger);

    var channelinfo={
        low:0,
        high:0,
        currentBlockHash:"",
        previousBlockHash:""
    };

    app.channelinfo=channelinfo;
    //enroll_admin
    fabricNet.enroll_admin(2,function (err,obj) {
        if(err==null) {
            logger.info("get genesis block");
            var g_option = configer.makeEnrollmentOptions(0);
            g_option.chaincode_id=configer.getChaincodeId();
            g_option.chaincode_version=configer.getChaincodeVersion();
            logger.info(g_option.chaincode_id);
            g_option.event_url=configer.getPeerEventUrl(configer.getFirstPeerName(configer.getChannelId()))

            fcw.query_channel_info(obj,g_option,function (err,resp) {
                if (err!=null){
                    logger.error("Error for getting channel info!");
                }else {
                    app.channelinfo.low=resp.height.low;
                    app.channelinfo.high=resp.height.high;
                    app.channelinfo.currentBlockHash=resp.currentBlockHash;
                    app.channelinfo.previousBlockHash=resp.previousBlockHash
                }
            });

            var cc_api=require(__dirname+'/utils/creditcheck_cc_api.js')(obj,g_option,fcw,logger);
            cc_api.setupEventHub(app.wss,app.channelinfo);
            app.cc_api=cc_api;
        }else{
            logger.error("Error for enroll admin to channel!");
        }
    });
}