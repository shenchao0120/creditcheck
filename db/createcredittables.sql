-- 创建表 compet_info(大赛信息)的当前表
SELECT 'Create Table user_info-用户信息...';
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info
(
user_id                       int             NOT NULL AUTO_INCREMENT,
user_loginName                VARCHAR(30)     NOT NULL,
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