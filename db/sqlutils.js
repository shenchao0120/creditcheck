/**
 * Created by wuweiwei on 2017/10/30.
 */


var mysql = require('mysql');


module.exports=function (configer,logger) {

    var sqlService = {};
    const reconnect=10; //数据库重连次数
    var count=1;
    var connection;

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
            var searchparm = {pkName:pkValue}
            var addSqlParams = []

            Object.keys( condtion ).forEach((k)=>{

                let v = condtion[k]

                addSqlParams.push(v)
                updatewhereparm = updatewhereparm+` and ${k}=? `

            })



            var sql = ` select  ${column} from ${tablename} where ${updatewhereparm} ${orderBy} ${limit}`

            logger.debug(` the search sql is : ${sql} `)



            connection.query(sql, function(err, rows, fields  ) {

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

            logger.debug(` the search sql is : ${sql} `)


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
    }
    /*
    sqlService.isUserAdmin=function (user_id) {
        var self=this;
        return new Promise(function (resolve,reject) {
            if(user_id==null || user_id.length==0){
                reject(new Error('User id is null'));
            }else{
                self.getRowByPk('user_info','','user_id',user_id)
                    .then((obj)=>{
                    resolve(obj);})
                    .catch(function(err){
                    reject(err)
                    });
            }
        })
    }
    */

    return sqlService;

}