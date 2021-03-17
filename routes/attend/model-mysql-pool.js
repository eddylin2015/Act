// attend

'use strict';

const mysql = require('mysql');

const mysqlcfg = require('../mysql250/mysql250config');

//const pool = mysql.createPool(options);

function list(userId, cb) {
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        // Use the connection
        if (err) { cb(err); return; }
        conn.query(
            'SELECT * FROM `ans` order by datet DESC ', [],
            (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                conn.release();
            }
        );
    });
}
function listMore(limit, datestr, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query(
            'SELECT *  FROM `ans` order by datet DESC LIMIT ? OFFSET ?', //, DAYOFWEEK(logDate)-1 dw
            [limit, token],
            (err, results) => {
                if (err) { cb(err); return; }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                conn.release();
            });
    });
}
function listBy(id, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query(
            'SELECT * FROM `ans` where createdById = ? order by datet desc  LIMIT ? OFFSET ?',
            [id, limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                conn.release();
            });
    });
}
function listTimestampBy(sdate, edate, limit, token, cb) {
    token = token ? parseInt(token, 100) : 0;
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query(
            'SELECT * FROM `ans` WHERE  (`datet` between ? and ? ) order by datet desc LIMIT ? OFFSET ?',
            [sdate, edate, limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                conn.release();
            });
    });
}

function create(id, data, cb) {
    //console.log(data);
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query('INSERT INTO `ans` SET ? ', [data], (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            read(id, data.keyid, cb);
            //read(res.insertId, cb);
            //cb(null);
            conn.release();
        });
    });
}

function read(userid, keyid, cb) {
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query(
            'SELECT * FROM `ans` WHERE `keyid` = ? ', keyid, (err, results) => {
                if (!err && !results.length) {
                    err = {
                        code: 404,
                        message: 'Not found'
                    };
                }
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, results[0]);
                conn.release();
            });
    });
}
function update(userid, keyid, data, cb) {
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query(
            'UPDATE `ans` SET ? WHERE `keyid` = ?  ', [data, keyid], (err) => {   //and `createdById` = ?
                if (err) {
                    cb(err);
                    return;
                }
                read(userid, keyid, cb);
                conn.release();
            });
    });
}

function _delete(id, keyid, cb) {
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query('DELETE FROM `ans` WHERE `keyid` = ? ', [keyid], cb);
        conn.release();
    });
}

module.exports = {
    createSchema: createSchema,
    list: list,
    listMore: listMore,
    listTimestampBy: listTimestampBy,
    create: create,
    read: read,
    listBy: listBy,
    update: update,
    delete: _delete
};

if (module === require.main) {
    const prompt = require('prompt');
    prompt.start();
    console.log(
        `Running this script directly will allow you to initialize your mysql
    database.\n This script will not modify any existing tables.\n`);
    prompt.get(['user', 'password'], (err, result) => {
        if (err) { return; }
        createSchema(result);
    });
}
/*
CREATE TABLE `books` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `title` varchar(255) collate utf8_bin default NULL,
  `author` varchar(255) collate utf8_bin default NULL,
  `logDate` varchar(255) character set utf8 default NULL,
  `description` text collate utf8_bin,
  `dept` int(11) default '0',
  `logtype` int(11) default '0',
  `createdBy` varchar(255) collate utf8_bin default NULL,
  `createdById` varchar(255) collate utf8_bin default NULL,
  `rootid` int(10) default '0',
  `parentid` int(10) default '0',
  `status` int(10) default '0',
  `followstaf` varchar(45) collate utf8_bin default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=utf8 COLLATE=utf8_bin
*/
function createSchema(config) {

    const connection = mysql.createConnection(extend({
        multipleStatements: true
    }, config));

    connection.query(
        `CREATE DATABASE IF NOT EXISTS \`eschool\`
    DEFAULT CHARACTER SET = 'utf8'
    DEFAULT COLLATE 'utf8_general_ci';
    USE \`eschool\`;
  CREATE TABLE \`ans\` (
  \`keyid\` varchar(16) NOT NULL default '',
  \`loginuser\` varchar(16) default NULL,
  \`desc\` varchar(64) character set utf8 collate utf8_bin NOT NULL,
  \`A\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`B\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`C\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`D\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`E\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`F\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`G\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`H\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`I\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`J\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`K\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`L\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`M\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`N\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`O\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`P\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`Q\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`R\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`S\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`T\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`U\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`V\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`W\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`X\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`Y\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`Z\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AA\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AB\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AC\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AD\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AE\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AF\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AG\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AH\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AI\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AJ\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AK\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AL\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AM\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AN\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AO\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AP\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AQ\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AR\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AS\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AT\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AU\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AV\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AW\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AX\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AY\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`AZ\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BA\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BB\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BC\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BD\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BE\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BF\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BG\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`BH\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`datet\` datetime default NULL,
  \`checkdate\` date NOT NULL,
  \`durtime\` varchar(11) NOT NULL,
  \`QM\` varchar(5) character set utf8 collate utf8_bin default NULL,
  \`note\` varchar(32) character set utf8 collate utf8_bin NOT NULL,
  \`CNO\` varchar(10) NOT NULL,
  \`createdBy\` varchar(255) collate utf8_bin default NULL,
  \`createdById\` varchar(255) collate utf8_bin default NULL,
  PRIMARY KEY  (\`keyid\`)
) ENGINE=MyISAM DEFAULT CHARSET=big5);`,
        (err) => {
            if (err) {
                throw err;
            }
            console.log('Successfully created schema');
            connection.end();
        }
    );
}