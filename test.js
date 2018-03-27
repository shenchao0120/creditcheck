/**
 * Created by wuweiwei on 2017/12/11.
 */
/*
var path=require('path');
var fs=require('fs');
var EC = require('elliptic').ec;

var fc=require('fabric-client');

var fcUtl=require(__dirname+'/node_modules/fabric-client/lib/utils.js')


var pubFilename='./config/crypto/creds/cd96d5260ad4757551ed4a5a991e62130f8008a0bf996e4e4b84cd097a747fec-pub';
var privFilename='./config/crypto/creds/cd96d5260ad4757551ed4a5a991e62130f8008a0bf996e4e4b84cd097a747fec-priv';


function loadPem(filename) {
   var pemPath=path.join(__dirname,filename);
   return fs.readFileSync(pemPath,'utf8')+ '\r\n';
}
pub=loadPem(pubFilename);
priv=loadPem(privFilename);
console.log("priv key:",loadPem(privFilename));

var suite=fcUtl.newCryptoSuite({software: true, keysize: 256, algorithm: EC});
var result=suite.importKey(pub,{algorithm:'X509Certificate',ephemeral:true});


console.log("pub key:",result);



*/


