/**
 * Created by wuweiwei on 2017/11/30.
 */
/* global $, window, document */
/* global toTitleCase, connect_to_server, refreshHomePanel, closeNoticePanel, openNoticePanel, show_tx_step, marbles*/
/* global pendingTxDrawing:true */
/* exported record_company, autoCloseNoticePanel, start_up, block_ui_delay*/
var ws = {};
var autoCloseNoticePanel = null;
var start_up = true;
var lsKey = 'creditcheck';
var fromLS = {};
var block_ui_delay = 15000; 								//default, gets set in ws block msg

// =================================================================================
// On Load
// =================================================================================
$(document).ready(function () {
    console.log('websocket connect to server..' );
    connect_to_server();

    // =================================================================================
    // jQuery UI Events
    // =================================================================================

});

