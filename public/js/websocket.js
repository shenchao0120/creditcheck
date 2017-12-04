/**
 * Created by wuweiwei on 2017/11/30.
 */
/* global new_block, $, document, WebSocket, escapeHtml, ws:true, start_up:true, known_companies:true, autoCloseNoticePanel:true */
/* global show_start_up_step, build_notification, build_user_panels, build_company_panel, populate_users_marbles, show_tx_step*/
/* global getRandomInt, block_ui_delay:true, build_a_tx, auditingMarble*/
/* exported transfer_marble, record_company, connect_to_server, refreshHomePanel, pendingTxDrawing*/

var getEverythingWatchdog = null;
var wsTxt = '[ws]';
var pendingTransaction = null;
var pendingTxDrawing = [];

// =================================================================================
// Socket Stuff
// =================================================================================
function connect_to_server() {
    var connected = false;
    connect();

    function connect() {
        var wsUri = null;
        if (document.location.protocol === 'https:') {
            wsTxt = '[wss]';
            wsUri = 'wss://' + document.location.hostname + ':' + document.location.port;
        } else {
            wsUri = 'ws://' + document.location.hostname + ':' + document.location.port;
        }
        console.log(wsTxt + ' Connecting to websocket', wsUri);

        ws = new WebSocket(wsUri);
        ws.onopen = function (evt) { onOpen(evt); };
        ws.onclose = function (evt) { onClose(evt); };
        ws.onmessage = function (evt) { onMessage(evt); };
        ws.onerror = function (evt) { onError(evt); };
    }

    function onOpen(evt) {
        console.log(wsTxt + ' CONNECTED');
        connected = true;
    }

    function onClose(evt) {
        console.log(wsTxt + ' DISCONNECTED', evt);
        connected = false;
        setTimeout(function () { connect(); }, 5000);					//try again one more time, server restarts are quick
    }

    function onMessage(msg) {
        try {
            var msgObj = JSON.parse(msg.data);
            console.log(wsTxt + ' rec', msgObj.msg, msgObj);

            //marbles
            if (msgObj.msg === 'everything') {
                console.log(wsTxt + ' rec', msgObj.msg, msgObj);

            }

            //marbles
            else if (msgObj.msg === 'users_marbles') {
                console.log(wsTxt + ' rec', msgObj.msg, msgObj);
            }

            // block
            else if (msgObj.msg === 'block' && msgObj.state ==='new_block' ) {
                console.log(wsTxt + ' rec', msgObj.msg, ': ledger blockheight', msgObj.payload.block_height, ': tx num',msgObj.payload.tx_num);
                $('#blockHeight .count').text(msgObj.payload.block_height);
                $('#blockTxNum .count').text(msgObj.payload.tx_num);

            }

            //marble owners
            else if (msgObj.msg === 'owners') {
                console.log(wsTxt + ' rec', msgObj.msg, msgObj);

            }

            //transaction error
            else if (msgObj.msg === 'tx_error') {
                console.log(wsTxt + ' rec', msgObj.msg, msgObj);

            }

            //all marbles sent
            else if (msgObj.msg === 'all_marbles_sent') {
                console.log(wsTxt + ' rec', msgObj.msg, msgObj);

            }
            //unknown
            else console.log(wsTxt + ' rec', msgObj.msg, msgObj);
        }
        catch (e) {
            console.log(wsTxt + ' error handling a ws message', e);
        }
    }

    function onError(evt) {
        console.log(wsTxt + ' ERROR ', evt);
    }
}

