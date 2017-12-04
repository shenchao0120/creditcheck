-- 创建表 user_info(用户信息)的当前表
SELECT 'Create Table user_info-用户信息...';
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info
(
user_id                       int             NOT NULL AUTO_INCREMENT,
user_loginName                NOT     NOT NULL,
user_email                    VARCHAR(30)     NULL,
user_type                     CHAR(1)         NOT NULL, -- 0 admin ,1 normal
user_password                 VARCHAR(50)     NOT NULL,
user_failLogin                int             DEFAULT 0,
user_status                   CHAR(1)         DEFAULT '0' ,
user_createDate               DATETIME       DEFAULT CURRENT_TIMESTAMP(),
user_lastLogin                DATETIME       DEFAULT CURRENT_TIMESTAMP(),
user_lastModDate              DATETIME       DEFAULT CURRENT_TIMESTAMP(),
user_loginIP                  VARCHAR(15)     NULL ,
user_mobilePhone              VARCHAR(30)     NULL,
PRIMARY KEY(user_id)
);


CREATE UNIQUE INDEX user_info_idx ON user_info(user_loginName ASC ,user_password ASC );

DROP TABLE IF EXISTS cus_base_info;

CREATE TABLE cus_base_info(
    cus_id      int      NOT NULL AUTO_INCREMENT,
    cus_name    VARCHAR(30)     NOT NULL,
    cus_id_num  VARCHAR(20)     NOT NULL,
    gender      CHAR(1)         NOT NULL,
    phone_num   VARCHAR(11)     NOT NULL,
    birthday    VARCHAR(10)     NOT NULL,
    marriage    CHAR(1)         DEFAULT 'N',
    email       VARCHAR(50)     NULL,
    city        VARCHAR(10)     NULL,
    address     VARCHAR(100)    NULL,
    company     VARCHAR(50)     NULL,
 PRIMARY KEY(cus_id)
);

CREATE UNIQUE INDEX cus_base_info_idx ON cus_base_info(cus_id_num ASC );

DROP TABLE IF EXISTS cus_credit_info;

CREATE TABLE cus_credit_info(
    cus_id      int      NOT NULL ,
    bus_type    VARCHAR(10) NOT NULL,
    bus_no      VARCHAR(20) NOT NULL,
    begin_dt    VARCHAR(10) NOT NULL,
    setl_dt    VARCHAR(10) NOT NULL,
    ccy         VARCHAR(3) NOT NULL,
    od_times    int        DEFAULT 0,
    pay_unit     CHAR(1)     NOT NULL,
    pay_num      int      NOT NULL,
    debt_Amt     Decimal(18,2)  NOT NULL,
    setl_Amt     Decimal(18,2)  NOT NULL,
    od_Amt     Decimal(18,2)  NOT NULL,
    own_int      Decimal(18,2)  NOT NULL,
    setl_int      Decimal(18,2)  NOT NULL,
    od_int       Decimal(18,2)  NOT NULL,
    remain_pay_num  int    NULL,
    nxt_pay_dt  VARCHAR(10)  NULL,
    last_pay_dt  VARCHAR(10)  NULL,
    month_pay_amt Decimal(18,2)   NULL,
    od_days     int NULL,
    own_od_int  Decimal(18,2)   NULL,
    set_od_int   Decimal(18,2)   NULL,
    classes CHAR(1)   NULL,
    PRIMARY KEY(cus_id,bus_type,bus_no)
);

CREATE UNIQUE INDEX cus_credit_info_idx ON cus_credit_info(bus_type , bus_no);


DROP TABLE IF EXISTS cus_deposit_info;


CREATE TABLE cus_deposit_info(
     cus_id      int      NOT NULL ,
     acc_type    VARCHAR(10) NOT NULL,
     acc_no      VARCHAR(20) NOT NULL,
     acc_state   VARCHAR(1) NOT NULL,
     open_dt    VARCHAR(10) NOT NULL,
     ccy         VARCHAR(3) NOT NULL,
     open_bank   VARCHAR(50)  NULL,
     balance    Decimal(18,2)   NULL,
     PRIMARY KEY(cus_id,acc_type,acc_no)
);

CREATE UNIQUE INDEX cus_deposit_info_idx ON cus_deposit_info(acc_type , acc_no);



DROP TABLE IF EXISTS cus_repay_info;

CREATE TABLE cus_repay_info(
    cus_id      int      NOT NULL ,
    bus_type    VARCHAR(10) NOT NULL,
    bus_no      VARCHAR(20) NOT NULL,
    ccy         VARCHAR(3) NOT NULL,
    perd_no     int         NULL,
    shd_pay_dt  VARCHAR(10) NOT NULL,
    real_pay_dt  VARCHAR(10)  NULL,
    shd_pay_amt   Decimal(18,2)  NOT NULL,
    real_pay_amt   Decimal(18,2) NULL,
    od_days    int NULL,
);


CREATE UNIQUE INDEX cus_repay_info_idx ON cus_repay_info(cus_id , bus_type,bus_no,shd_pay_dt);






