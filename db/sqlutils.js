/**
 * Created by wuweiwei on 2017/10/30.
 */
'use strict'

var mysql = require('mysql');

var co = require('co');


module.exports=function (configer,logger) {

    var sqlService = {};
    const reconnect=10; //数据库重连次数
    var count=1;
    var connection;

    const PAGECOUNT=6;

    function handleDisconnect() {
        connection = mysql.createConnection({
            host: configer.config.mysql.host,
            user: configer.config.mysql.username,
            password: configer.config.mysql.passwd,
            database: configer.config.mysql.database
        });
        connection.connect(function (err) {
            // The server is either down
            // or restarting
            if (err) {
                // We introduce a delay before attempting to reconnect,
                // to avoid a hot loop, and to allow our node script to
                // process asynchronous requests in the meantime.
                if(count<=reconnect) {
                    logger.error('Error when connecting to db [%d times]  :%s', count++, err);
                    setTimeout(handleDisconnect, 2000);
                }else{
                    logger.error('Error to connect db ,connect times exceed limit!', count++, err);
                }
            }
        });


        connection.on('error', function (err) {
            logger.error('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            } else {
                sqlService.closeConnection
                throw err;
            }
        });

        connection.on('connect', function () {
            logger.info(' mysql connect success!')
            count=0;

        });

        sqlService.connection=connection;
    }
    handleDisconnect();
    //打开连接
    sqlService.openConnection=function () {
        sqlService.connection.connect();
    }
    sqlService.closeConnection=function () {
        logger.debug('mysql disconnect')
        sqlService.connection.end();
    }


    /**
     *
     * Save the value to db.
     *
     * @param String tablename  the table name.
     * @param String array ColumnValues  the table column and value Map.
     *
     * @author robertfeng <fx19800215@163.com>
     *
     */
    sqlService.saveRow=function ( tablename , columnValues  ){


        return new Promise(function (resolve,reject){

            var  addSqlParams = []
            var  updatesqlcolumn = []
            var  updatesqlflag = []

            Object.keys(columnValues).forEach((k)=>{

                let v = columnValues[k]

                addSqlParams.push(v)
                updatesqlcolumn.push(k)
                updatesqlflag.push('?')

            })

            var updatesqlparmstr = updatesqlcolumn.join(',')
            var updatesqlflagstr = updatesqlflag.join(',')


            var  addSql = `INSERT INTO ${tablename}  ( ${updatesqlparmstr} ) VALUES( ${updatesqlflagstr}  )`;

            logger.debug(`Insert sql is ${addSql}`)

            connection.query(addSql,addSqlParams,function (err, result) {

                if(err){
                    logger.error('[INSERT ERROR] - ',err.message);
                    reject(err)
                }

                logger.debug('--------------------------INSERT----------------------------');
                logger.debug('INSERT ID:',result.insertId);
                logger.debug('-----------------------------------------------------------------\n\n');

                resolve(result.insertId)
            });
        })




    }


    /**
     * Update table
     *
     * @param String        tablename  the table name.
     * @param String array  columnAndValue  the table column and value Map.
     * @param String        pkName   the primary key name.
     * @param String        pkValue  the primary key value.
     *
     * @author robertfeng <fx19800215@163.com>
     *
     *
     */
    sqlService.updateRowByPk=function (tablename,columnAndValue,pkName,pkValue){

        return new Promise(function (resolve,reject){

            var  addSqlParams = []
            var  updateParms = []

            var updateparm = " set 1=1 "

            Object.keys(columnAndValue).forEach((k)=>{

                let v = columnAndValue[k]

                addSqlParams.push(v)
                //updateparm = updateparm + ` ,${k}=? `
                updateParms.push(`${k} = ?`)

            })

            var updatewhereparm = " (1=1)  "
            var searchparm = {pkName:pkValue}

            Object.keys(searchparm).forEach((k)=>{

                let v = searchparm[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm+` and ${k}=? `

            })

            var updateParmsStr = updateParms.join(',')

            var  addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${pkName} = ${pkValue} `;

            logger.debug(`update sql is ${addSql}`)

            connection.query(addSql,addSqlParams,function (err, result) {

                if(err){
                    logger.error('[INSERT ERROR] - ',err.message);
                    reject(err)
                }

                logger.debug('--------------------------UPDATE----------------------------');
                logger.debug(' update result :',result.affectedRows );
                logger.debug('-----------------------------------------------------------------\n\n');

                resolve(result.affectedRows)
            });
        })



    }


    /**
     * Update table
     *
     * @param String        tablename  the table name.
     * @param String array  columnAndValue  the table column and value Map.
     * @param String array  condition   the primary key name.
     * @param db ojbect     DB          the sqllite private database visit object
     *
     * @author robertfeng <fx19800215@163.com>
     *
     *
     */
    sqlService.updateRow=function(tablename,columnAndValue,condition){


        return new Promise(function (resolve,reject){

            var  addSqlParams = []
            var  updateParms = []

            var updateparm = " set 1=1 "


            Object.keys(columnAndValue).forEach((k)=>{

                let v = columnAndValue[k]

                addSqlParams.push(v)
                //updateparm = updateparm + ` ,${k}=? `
                updateParms.push(`${k} = ?`)

            })

            var updatewhereparm = " (1=1)  "


            Object.keys(condition).forEach((k)=>{

                let v = condition[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm+` and ${k}=? `

            })


            var updateParmsStr = updateParms.join(',')

            var  addSql = ` UPDATE ${tablename} set ${updateParmsStr} WHERE ${updatewhereparm} `;

            logger.debug(`update sql is ${addSql}`)

            connection.query(addSql,addSqlParams,function (err, result) {

                if(err){
                    logger.error('[INSERT ERROR] - ',err.message);
                    reject(err)
                }

                logger.debug('--------------------------UPDATE----------------------------');
                logger.debug(' update result :',result.affectedRows );
                logger.debug('-----------------------------------------------------------------\n\n');

                resolve(result.affectedRows)
            });
        })

    }


    /**
     *  excute update or delete  sql.
     *  @param string  updateSql   the excute sql
     */
    sqlService.updateBySql= function (updateSql){

        return new Promise(function (resolve,reject){


            logger.debug(`update sql is :  ${updateSql}`)

            connection.query(updateSql,[],function (err, result) {

                if(err){
                    logger.error('[INSERT ERROR] - ',err.message);
                    reject(err)
                }

                logger.debug('--------------------------UPDATE----------------------------');
                logger.debug(' update result :',result.affectedRows );
                logger.debug('-----------------------------------------------------------------\n\n');

                resolve(result.affectedRows)
            });
        })


    }


    /**
     * get row by primary key
     * @param String tablename   the table name.
     * @param String column      the filed of search result.
     * @param String pkColumn	    the primary key column name.
     * @param String value       the primary key value.
     *
     *
     */
    sqlService.getRowByPk =function (tablename,column,pkColumn,value){


        return new Promise(function (resolve,reject){

            if( column == '' )
                column = '*'

            var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `
            logger.debug(sql);

            connection.query(sql, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getRowByPk ')

                if( !rows || rows.length == 0 )
                    resolve(null)
                else
                    resolve(rows[0])
            });
        })


    }

    /**
     * 查询一条记录
     *
     * @param unknown_type sql
     * @param unknown_type DB
     * @return unknown
     */
    sqlService.getRowByPkOne=function (sql){

        return new Promise(function (resolve,reject){

            //var sql = ` select  ${column} from ${tablename} where ${pkColumn} = ${value} `

            connection.query(sql, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(` the getRowByPkOne sql ${sql}`)


                if( !rows || rows.length == 0 )
                    resolve(null)
                else
                    resolve(rows[0])


            });
        })

    }


    /**
     * search table
     * @param String tablename  the table name
     * @param String columns    the field of seach result
     * @param String ondtion    the search condition,it is sotre by array. exp condition = array("id"=>"1");
     * @param String orderBy    the order desc.
     * @param String limit      the pagedtion.
     *
     */
    sqlService.getRowsByCondition=function (tablename,column ,condtion,orderBy,limit){


        return new Promise(function (resolve,reject){

            if( column == '' )
                column = '*'

            var updatewhereparm = " (1=1)  "
            //var searchparm = {pkName:pkValue}
            var addSqlParams = []

            Object.keys( condtion ).forEach((k)=>{

                let v = condtion[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm+` and ${k}=? `

            })



            var sql = ` select  ${column} from ${tablename} where ${updatewhereparm} ${orderBy} ${limit}`

            logger.debug(` the search sql is : ${sql} `)

            connection.query(sql,addSqlParams, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getRowsByCondition ')

                resolve(rows)



            });
        })

    }


    /**
     * search table by sql
     * @param datatype sqlchareter   the table name
     * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
     * @param datatype limit         the pagedtion.
     *
     */
    sqlService.getRowsBySQl=function (sqlchareter,condition,limit){

        return new Promise(function (resolve,reject){


            var updatewhereparm = " (1=1)  "
            var addSqlParams = []

            Object.keys( condition ).forEach((k)=>{

                let v = condition[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm + ` and ${k}=? `

            })


            var sql = ` ${sqlchareter} where ${updatewhereparm}   ${limit}`

            logger.debug(` the search sql is : ${sql} `);

            connection.query(sql, addSqlParams ,function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                console.log(  ` The solution is: ${rows.length }  `  );
                logger.debug( ' The getRowsBySQl  ')

                resolve(rows)

            });
        })


    }


    /**
     * search table by sql and it's not condtion
     *
     * @param datatype sqlchareter   the table name
     * @param datatype ondtion       the search condition,it is sotre by array. exp condition = array("id"=>"1");
     * @param datatype limit         the pagedtion.
     *
     */
    sqlService.getRowsBySQlNoCondtion=function (sqlchareter,limit){

        return new Promise(function (resolve,reject){


            var sql = `${sqlchareter} ${limit}`

            connection.query(sqlchareter, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(` the getRowsBySQlNoCondtion ${sql}`)


                resolve(rows)

            });
        })


    }

    /**
     * 自动橱窗日志查找/评价历史记录查找
     * @param unknown_type sql
     * @param unknown_type DB
     * @return unknown
     */
    sqlService.getRowsBySQlCase=function (sql){

        return new Promise(function (resolve,reject){



            connection.query(sql, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(` the getRowsBySQlCase ${sql}`)

                if( !rows || rows.length == 0 )
                    resolve(null)
                else
                    resolve(rows[0])


            });
        })
    }


    /**
     *
     * @param sql
     * @param key
     * @returns {Promise}
     *
     */
    sqlService.getSQL2Map=function (sql,key){

        return new Promise(function (resolve,reject){

            connection.query(sql, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                logger.debug(  `The solution is: ${rows.length }  `  );


                var keymap = new Map();

                for( var ind = 0 ; ind<rows.length;ind++ ){

                    logger.debug(  `The ind value is: ${ rows[ind].id }  `  );
                    keymap.set(rows[ind][key],rows[ind])
                }

                resolve(keymap)


            });
        })
    }


    /**
     * 根据SQL获取MAP数组
     *
     * @param unknown_type sql
     * @param unknown_type key
     * @return unknown
     */
    sqlService.getSQL2Map4Arr=function (sql,key){

        return new Promise(function (resolve,reject){

            connection.query(sql, function(err, rows, fields  ) {

                if (err){
                    reject(err)
                }

                // logger.debug(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getSqlMap ')

                var keymap = new Map();

                for( var ind = 0 ; ind<rows.length;ind++ ){

                    var keyvalue = rows[ind][key]
                    var arrvalue  = [];

                    if( keymap.has(keyvalue)  ){
                        arrvalue = keymap.get(keyvalue)
                        arrvalue.push(rows)
                    }else{
                        arrvalue.push(rows)
                    }

                    keymap.set(keyvalue,arrvalue)
                }


                resolve(keymap)

            });
        })
    }

    sqlService.getCountByCondition=function (tablename,condtion){


        return new Promise(function (resolve,reject){

            var updatewhereparm = " (1=1)  "
            //var searchparm = {pkName:pkValue}
            var addSqlParams = []

            Object.keys( condtion ).forEach((k)=>{

                let v = condtion[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm+` and ${k}=? `

            })



            var sql = ` select  count(1) from ${tablename} where ${updatewhereparm} `

            logger.debug(` the search sql is : ${sql} `)

            connection.query(sql,addSqlParams, function(err, result  ) {

                if (err){
                    reject(err)
                }

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getCountByCondition ')

                resolve(result)

            });
        })

    }


// ----------------------------------------------------------------------------------------------------------------------------
// Business related Part
// ----------------------------------------------------------------------------------------------------------------------------

    sqlService.isUserExisted=function (user_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(user_id==null || user_id.length==0){
                reject(new Error('User id is null'));
            }else{
                self.getRowByPk('user_info','','user_id',user_id)
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function(err){
                        logger.info('user not exist.')
                        reject(err);
                    });
            }
        })
    }

    sqlService.findUser=function (user_name) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(user_name==null || user_name.length==0){
                reject(new Error('User name is null'));
            }else{
                self.getRowByPk('user_info','','user_loginName',"'"+user_name+"'")
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function(err){
                        logger.info('user not exist.')
                        reject(err);
                    });
            }
        })
    };

    sqlService.findCusBaseInfoByIdNum=function (id_num) {
        var self=this;
        logger.info("Find CusBaseInfo By Id Num:",id_num);
        return new Promise(function (resolve,reject) {
            if(id_num==null ||id_num.length==0){
                reject(new Error('The cus id num is null.'))
            }else{
                self.getRowByPk('cus_base_info','','cus_id_num',"'"+id_num+"'")
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id num not exist.');
                        reject(err);
                    })
            }
        });
    };

    sqlService.findCusBaseInfoByCusId=function (cus_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id==null ||cus_id.length==0){
                reject(new Error('The cus id num is null.'))
            }else{
                self.getRowByPk('cus_base_info','','cus_id',"'"+cus_id+"'")
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id num not exist.');
                        reject(err);
                    })
            }
        });
    };

    sqlService.findCusBaseInfoByPage=function (pageNum) {
        if (pageNum==null){
            pageNum=1;
        }
        var pageStart= PAGECOUNT*(pageNum-1);

        var limit='LIMIT '+ pageStart+' ,'+PAGECOUNT;
        logger.debug('limit:',limit);
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getRowsByCondition('cus_base_info','',{},'',limit)
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id num not exist.');
                        reject(err);
                    });
        });
    };

    sqlService.queryCusBaseInfoPageNum=function () {
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getCountByCondition('cus_base_info',{})
                .then((result)=>{
                    var jsonObj=result[0];
                    var count=parseInt(jsonObj['count(1)']/PAGECOUNT)+1;
                    resolve(count);
                })
                .catch(function (err) {
                    logger.info('Error or no record');
                    reject(err);
                })
        })
    };


    sqlService.findCusCreditInfoByCusId=function (cus_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id==null ||cus_id.length==0){
                reject(new Error('The cus id is null.'))
            }else{
                self.getRowsByCondition('cus_credit_info','',{cus_id:cus_id},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };

    sqlService.findCusCreditInfoByCusIdNum=function (cus_id_num) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id_num==null ||cus_id_num.length==0){
                reject(new Error('The cus id is null.'))
            }else{
                self.getRowsByCondition('cus_credit_info','',{cus_id_num:cus_id_num},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };


    sqlService.findCusDepositInfoByCusId=function (cus_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id==null ||cus_id.length==0){
                reject(new Error('The cus id is null.'))
            }else{
                self.getRowsByCondition('cus_deposit_info','',{cus_id:cus_id},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };

    sqlService.findCusDepositInfoByCusIdNum=function (cus_id_num) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id_num==null ||cus_id_num.length==0){
                reject(new Error('The cus id is null.'))
            }else{
                self.getRowsByCondition('cus_deposit_info','',{cus_id_num:cus_id_num},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };

    sqlService.findCusRepayInfoByCusId=function (cus_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id==null ||cus_id.length==0){
                reject(new Error('The cus id  is null.'))
            }else{
                self.getRowsByCondition('cus_repay_info','',{cus_id:cus_id},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };

    sqlService.findCusRepayInfoByCusIdNum=function (cus_id_num) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(cus_id_num==null ||cus_id_num.length==0){
                reject(new Error('The cus id num  is null.'))
            }else{
                self.getRowsByCondition('cus_repay_info','',{cus_id_num:cus_id_num},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('cus id not exist.');
                        reject(err);
                    });
            }
        });
    };


    sqlService.insertSubmitRequest=function(tx_id,cus_id_num,req_type,time_line,req_orgIDs){
        var self=this;
        return new Promise(function (resolve,reject) {
            if(tx_id==null || cus_id_num==null || req_type==null || time_line==null){
                reject(new Error('The arguments can not be null.'));
            }
            else{
                var curDate = new Date().format("yyyy-MM-dd");
                logger.debug("the curdate:",curDate);
                self.saveRow('chain_submit_request',{
                    tx_id:tx_id,
                    cus_id_num:cus_id_num,
                    req_dt:curDate,
                    req_type:req_type,
                    time_line:time_line,
                    req_orgIDs:req_orgIDs
                }).then((obj)=>{
                    resolve(obj);
                }).catch((err)=>{
                    reject(err);
                });
            };
        });
    };

    sqlService.findChainSelfRequestByTxID=function (tx_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(tx_id==null ||tx_id.length==0){
                reject(new Error('The tx id is null.'))
            }else{
                self.getRowsByCondition('chain_submit_request','',{tx_id:tx_id},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('tx id not exist.');
                        reject(err);
                    });
            }
        });
    };

    sqlService.findChainSelfRequest=function (pageNum) {
        if (pageNum==null){
            pageNum=1;
        }
        var pageStart= PAGECOUNT*(pageNum-1);

        var limit='LIMIT '+ pageStart+' ,'+PAGECOUNT;
        logger.debug('limit:',limit);
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getRowsByCondition('chain_submit_request','',{},'',limit)
                .then((obj)=>{
                    resolve(obj);})
                .catch(function (err) {
                    logger.info('Chain self request does not exist.');
                    reject(err);
                });
        });
    };

    sqlService.queryChainSelfRequestPageNum=function () {
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getCountByCondition('chain_submit_request',{})
                .then((result)=>{
                    var jsonObj=result[0];
                    var count=parseInt(jsonObj['count(1)']/PAGECOUNT)+1;
                    resolve(count);
                })
                .catch(function (err) {
                    logger.info('Error or no record');
                    reject(err);
                })
        })
    };


    sqlService.insertReceiveRequest=function(tx_id,block_no,from_orgID,cus_id_num,req_type,time_line,req_orgIDs,pub_key){
        var self=this;
        if (pub_key==null){
            pub_key="123";
        }
        return new Promise(function (resolve,reject) {
            if(tx_id==null || cus_id_num==null || req_type==null || time_line==null){
                reject(new Error('The arguments can not be null.'));
            }
            else{
                var curDate = new Date().format("yyyy-MM-dd");
                logger.debug("the curdate:",curDate);
                self.saveRow('chain_receive_request',{
                    tx_id:tx_id,
                    block_no:block_no,
                    from_orgID:from_orgID,
                    cus_id_num:cus_id_num,
                    req_dt:curDate,
                    req_type:req_type,
                    time_line:time_line,
                    req_orgIDs:req_orgIDs,
                    pub_key:pub_key
                }).then((obj)=>{
                    resolve(obj);
                }).catch((err)=>{
                    reject(err);
                });
            };
        });
    };

    sqlService.findChainReceiveRequest=function (pageNum) {
        if (pageNum==null){
            pageNum=1;
        }
        var pageStart= PAGECOUNT*(pageNum-1);

        var limit='LIMIT '+ pageStart+' ,'+PAGECOUNT;
        logger.debug('limit:',limit);
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getRowsByCondition('chain_receive_request','',{},' order by stmp desc',limit)
                .then((obj)=>{
                    resolve(obj);})
                .catch(function (err) {
                    logger.info('Chain receive request does not exist.');
                    reject(err);
                });
        });
    };

    sqlService.queryChainReceiveRequestPageNum=function () {
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getCountByCondition('chain_receive_request',{})
                .then((result)=>{
                    var jsonObj=result[0];
                    var count=parseInt(jsonObj['count(1)']/PAGECOUNT)+1;
                    resolve(count);
                })
                .catch(function (err) {
                    logger.info('Error or no record');
                    reject(err);
                })
        })
    };

    sqlService.queryAllCusInfoByID=function (cus_num_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(typeof cus_num_id === 'undefined' || cus_num_id.length==0){
                reject(new Error("custom number id is null."));
            }
            co(function *() {
                var result = yield [
                    self.findCusBaseInfoByIdNum(cus_num_id)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("FindCusBaseInfoByIdNum err:", err);
                        }),

                    self.findCusCreditInfoByCusIdNum(cus_num_id)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("FindCusCreditInfoByCusId err:", err);
                        }),
                    self.findCusDepositInfoByCusIdNum(cus_num_id)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("FindCusDepositInfoByCusId err:", err);
                        }),
                    self.findCusRepayInfoByCusIdNum(cus_num_id)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("FindCusRepayInfoByCusId err:", err);
                        }),
                ];
                if (result[0]==null){
                    reject(new Error("The cus num id is not exist"))
                }
                resolve({baseinfo: result[0], creditinfo: result[1],depositinfo:result[2],repayinfo:result[3]});
            }).catch((err) => {
                logger.error("ChainSelfRequest err:", err);
                reject(err);
            })
        });

    };

    sqlService.updateChainReceiveRequestState=function (tx_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if (typeof tx_id === 'undefined' || tx_id.length == 0) {
                reject(new Error("Tx_id is null."));
            };
            self.updateRow('chain_receive_request',{replied:'Y'},{tx_id:tx_id})
                .then((obj)=>{
                    resolve(obj);})
                .catch((err)=>{
                    reject(err);
                });
        });
    };

    sqlService.insertReceiveRespond=function(tx_id,block_no,from_orgID,is_crypto,rsp_dt,rsp_dtl){
        var self=this;

        return new Promise(function (resolve,reject) {
            if(tx_id==null || from_orgID==null){
                reject(new Error('The arguments can not be null.'));
            }
            else{
                self.saveRow('chain_receive_respond',{
                    tx_id:tx_id,
                    block_no:block_no,
                    from_orgID:from_orgID,
                    is_crypto:is_crypto,
                    rsp_dt:rsp_dt,
                    rsp_dtl:rsp_dtl
                }).then((obj)=>{
                    resolve(obj);
                }).catch((err)=>{
                    reject(err);
                });
            };
        });
    };

    sqlService.queryReceiveRespondByPage=function(tx_id,pageNum){
        if (pageNum==null){
            pageNum=1;
        }
        var pageStart= PAGECOUNT*(pageNum-1);

        var limit='LIMIT '+ pageStart+' ,'+PAGECOUNT;
        logger.debug('limit:',limit);
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getRowsByCondition('chain_receive_respond','',{tx_id:tx_id},' order by stmp desc',limit)
                .then((obj)=>{
                    resolve(obj);})
                .catch(function (err) {
                    logger.info('Chain receive request does not exist.');
                    reject(err);
                });
        });
    };

    sqlService.queryReceiveRespondPageNum=function (tx_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            self.getCountByCondition('chain_receive_respond',{tx_id:tx_id})
                .then((result)=>{
                    var jsonObj=result[0];
                    var count=parseInt(jsonObj['count(1)']/PAGECOUNT)+1;
                    resolve(count);
                })
                .catch(function (err) {
                    logger.info('Error or no record');
                    reject(err);
                })
        })
    };



    sqlService.recoverRespondCusInfo=function (jsonObj,tx_id,from_orgID,rsp_dt) {

        var self = this;

        var baseInfo = jsonObj.baseinfo;
        var creditInfo = jsonObj.creditinfo;
        var depositInfo = jsonObj.depositinfo;
        var repayInfo = jsonObj.repayinfo;

        baseInfo.tx_id = tx_id;
        baseInfo.from_orgID = from_orgID;
        baseInfo.rsp_dt = rsp_dt;
        if (typeof creditInfo !== 'undefined') {
            creditInfo.forEach(function (item, index) {
                item.tx_id = tx_id;
                item.from_orgID = from_orgID;
                item.rsp_dt = rsp_dt;
            });
        }
        if (typeof depositInfo !== 'undefined') {
            depositInfo.forEach(function (item, index) {
                item.tx_id = tx_id;
                item.from_orgID = from_orgID;
                item.rsp_dt = rsp_dt;
            });
        }
        if (typeof repayInfo !== 'undefined') {
            repayInfo.forEach(function (item, index) {
                item.tx_id = tx_id;
                item.from_orgID = from_orgID;
                item.rsp_dt = rsp_dt;
            });
        }

        return new Promise(function (resolve,reject) {
            co(function *() {
                var result = yield [
                    self.insertReceiveBaseInfo(baseInfo)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("insertReceiveBaseInfo err:", err);
                        }),

                    self.insertReceiveCreditInfo(creditInfo)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("insertReceiveCreditInfo err:", err);
                        }),
                    self.insertReceiveDepositInfo(depositInfo)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("insertReceiveDepositInfo err:", err);
                        }),
                    self.insertReceiveRepayInfo(repayInfo)
                        .then((objs) => {
                            return objs;
                        })
                        .catch((err) => {
                            logger.error("insertReceiveRepayInfo err:", err);
                        }),
                ];
                resolve(result[0]);
            });
        }).catch((err) => {
            logger.error("RecoverRespondCusInfo err:", err);
            reject(err);
        });
    };


    sqlService.insertReceiveBaseInfo=function(baseInfo){
        var self=this;

        return new Promise(function (resolve,reject) {
            if(typeof baseInfo ==='undefined'){
                resolve(new Error('The arguments can not be null.'));
            }
            else{
                self.saveRow('rsp_cus_base_info', baseInfo
                ).then((obj)=>{
                    resolve(obj);
                }).catch((err)=>{
                    reject(err);
                });
            };
        });
    };

    sqlService.insertReceiveCreditInfo=function(creditInfo){
        var self=this;

        return new Promise(function (resolve,reject) {
            if(typeof creditInfo ==='undefined'){
                resolve({});            }
            else{
                creditInfo.forEach(function(item,index){
                    self.saveRow('rsp_cus_credit_info', item
                    ).then((obj)=>{
                        resolve(obj);
                    }).catch((err)=>{
                        reject(err);
                    });
                });
            };
        });
    };

    sqlService.insertReceiveDepositInfo=function(depositInfo){
        var self=this;

        return new Promise(function (resolve,reject) {
            if(typeof depositInfo ==='undefined'){
                resolve({});            }
            else{
                depositInfo.forEach(function(item,index){
                    self.saveRow('rsp_cus_deposit_info', item
                    ).then((obj)=>{
                        resolve(obj);
                    }).catch((err)=>{
                        reject(err);
                    });
                });
            };
        });
    };

    sqlService.insertReceiveRepayInfo=function(repayInfo){
        var self=this;

        return new Promise(function (resolve,reject) {
            if(typeof repayInfo ==='undefined'){
                resolve({});            }
            else{
                repayInfo.forEach(function(item,index){
                    self.saveRow('rsp_cus_repay_info', item
                    ).then((obj)=>{
                        resolve(obj);
                    }).catch((err)=>{
                        reject(err);
                    });
                });
            };
        });
    };

    sqlService.findReceiveBaseInfo=function (tx_id,from_orgID) {
        var self=this;
        logger.info("Find ReceiveBaseInfo By tx_id Num:",tx_id);
        return new Promise(function (resolve,reject) {
            if(tx_id==null ||tx_id.length==0){
                reject(new Error('The tx_id is null.'))
            }else{
                self.getRowsByCondition('rsp_cus_base_info','',{tx_id:tx_id,from_orgID:from_orgID},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('tx_id num not exist.');
                        reject(err);
                    })
            }
        });
    };

    sqlService.findReceiveCreditInfo=function (tx_id,from_orgID) {
        var self=this;
        logger.info("Find ReceiveCreditInfo By tx_id Num:",tx_id);
        return new Promise(function (resolve,reject) {
            if(tx_id==null ||tx_id.length==0){
                reject(new Error('The tx_id is null.'))
            }else{
                self.getRowsByCondition('rsp_cus_credit_info','',{tx_id:tx_id,from_orgID:from_orgID},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('tx_id num not exist.');
                        reject(err);
                    })
            }
        });
    };

    sqlService.findReceiveDepositInfo=function (tx_id,from_orgID) {
        var self=this;
        logger.info("Find ReceiveDepositInfo By tx_id Num:",tx_id);
        return new Promise(function (resolve,reject) {
            if(tx_id==null ||tx_id.length==0){
                reject(new Error('The tx_id is null.'))
            }else{
                self.getRowsByCondition('rsp_cus_deposit_info','',{tx_id:tx_id,from_orgID:from_orgID},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('tx_id num not exist.');
                        reject(err);
                    })
            }
        });
    };

    sqlService.findReceiveRepayInfo=function (tx_id,from_orgID) {
        var self=this;
        logger.info("Find ReceiveDRepayInfo By tx_id Num:",tx_id);
        return new Promise(function (resolve,reject) {
            if(tx_id==null ||tx_id.length==0){
                reject(new Error('The tx_id is null.'))
            }else{
                self.getRowsByCondition('rsp_cus_repay_info','',{tx_id:tx_id,from_orgID:from_orgID},'','')
                    .then((obj)=>{
                        resolve(obj);})
                    .catch(function (err) {
                        logger.info('tx_id num not exist.');
                        reject(err);
                    })
            }
        });
    };


    sqlService.insertBlockInfo=function(block_num,tx_num,data_hash,previous_hash){
        var self=this;
        return new Promise(function (resolve,reject) {
            if(typeof block_num ==='undefined'){
                resolve({});            }
            else{
                    self.saveRow('block_info', {block_num:block_num,tx_num:tx_num,data_hash:data_hash,previous_hash:previous_hash}
                    ).then((obj)=>{
                        resolve(obj);
                    }).catch((err)=>{
                        reject(err);
                    });
            };
        });
    };

    sqlService.getTxCount=function (){
        return new Promise(function (resolve,reject){

            var addSqlParams = []

            var sql = ` select  sum(tx_num) from block_info where 1=1 `


            connection.query(sql,addSqlParams, function(err, result  ) {

                if (err){
                    reject(err)
                }
                var jsonObj=result[0];
                var tx_num=parseInt(jsonObj['sum(tx_num)']);

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getTxCount ')

                resolve(tx_num)

            });
        })

    }


    sqlService.getLocalCusCount=function (){
        return new Promise(function (resolve,reject){

            var addSqlParams = []

            var sql = ` select  count(1) from cus_base_info where 1=1 `


            connection.query(sql,addSqlParams, function(err, result  ) {

                if (err){
                    reject(err)
                }
                var jsonObj=result[0];
                var cus_num=parseInt(jsonObj['count(1)']);

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getLocalCusCount ')

                resolve(cus_num)

            });
        })

    }


    sqlService.getChainRequestCount=function (){
        return new Promise(function (resolve,reject){

            var addSqlParams = []

            var sql = ` select  count(1) from chain_submit_request where 1=1 `


            connection.query(sql,addSqlParams, function(err, result  ) {

                if (err){
                    reject(err)
                }
                var jsonObj=result[0];
                var cus_num=parseInt(jsonObj['count(1)']);

                // console.log(  `The solution is: ${rows.length }  `  );
                logger.debug(' the getLocalCusCount ')

                resolve(cus_num)

            });
        })

    }

    return sqlService;

}