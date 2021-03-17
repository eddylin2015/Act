// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const mysql = require('mysql');

const options = {
    host: config.get('ITBBSMYSQL_HOST'),
    user: config.get('ITBBSMYSQL_USER'),
    password: config.get('ITBBSMYSQL_PASSWORD'),
    database: config.get('ITBBSMYSQL_DATABASE')
};

//const connection = mysql.createConnection(options);
const pool = mysql.createPool(options);

function list(userId, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        // Use the connection
        connection.query(
            'SELECT * FROM `worknote` order by id DESC LIMIT ? OFFSET ?', [limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();
            }
        );
    });
}

function listBy(userId, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE `createdById` = ? order by id DESC LIMIT ? OFFSET ?  ;',
            [userId, limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();

            });
    });
}
function listToNote(userid,limit,token,cb){
    token = token ? parseInt(token, 10) : 0;
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE topNote=1 order by id DESC LIMIT ? OFFSET ?  ;',
            [limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();
            });
    });
}
function listTimestampStatusBy(userId, author, sdate,edate, logendstatus, limit, token, cb)
{
    token = token ? parseInt(token, 30) : 0;
    let logstatus=logendstatus==2 ? " and deptlog=0 ": " ";
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE `author` = ?  and (`logDate` between ? and ? ) '+logstatus+' order by if(rootid = 0, id, rootid),parentid  LIMIT ? OFFSET ?',
            [author,sdate,edate,limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();

            });
    });
}
function listTimestampBy(userId, author, sdate,edate, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;

    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE `author` = ?  and (`logDate` between ? and ? ) order by if(rootid = 0, id, rootid),parentid  LIMIT ? OFFSET ?',
            [author,sdate,edate,limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();

            });
    });
}

function listByKW( kw, jobtype,sdate, edate, deptlog, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    if(deptlog==1){

        pool.getConnection(function (err, connection) {
            if(err){cb(err);return;}
            connection.query(
                "SELECT * FROM `worknote` WHERE `deptlog`=0 and (`logDate` between ? and ? ) order by if(`rootid` = 0, `id`, `rootid`) DESC LIMIT ? OFFSET ?",
                [  sdate, edate, limit, token],
                (err, results) => {
                    if (err) { cb(err); return; }
                    const hasMore = results.length === limit ? token + results.length : false;
                    cb(null, results, hasMore);
                    connection.release();
                });
        });
    }
    else if (jobtype == "") {
        pool.getConnection(function (err, connection) {
            if(err){cb(err);return;}
            connection.query(
                "SELECT * FROM `worknote` WHERE (`description` like ? )  and (`logDate` between ? and ? ) order by if(rootid = 0, id, rootid),parentid  LIMIT ? OFFSET ?",
                ["%" + kw + "%",  sdate, edate, limit, token],
                (err, results) => {
                    if (err) { cb(err); return; }
                    const hasMore = results.length === limit ? token + results.length : false;
                    cb(null, results, hasMore);
                    connection.release();
                });
        });
    }
    else {
        pool.getConnection(function (err, connection) {
            if(err){cb(err);return;}
            connection.query(
                "SELECT * FROM `worknote` WHERE (`description` like ? and `jobtype` like ? )  and (`logDate` between ? and ? ) order by if(rootid = 0, id, rootid),parentid  LIMIT ? OFFSET ?",
                ["%" + kw + "%", "%" + jobtype + "%", sdate, edate, limit, token],
                (err, results) => {
                    if (err) { cb(err); return;  }
                    const hasMore = results.length === limit ? token + results.length : false;
                    cb(null, results, hasMore);
                    connection.release();
                });
        });
    }
}
function listByParentid(userId, rootid, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;

    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE id=? or `rootid` = ? or `parentid` = ?  LIMIT ? OFFSET ?',
            [rootid, rootid, rootid, limit, token],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                const hasMore = results.length === limit ? token + results.length : false;
                cb(null, results, hasMore);
                connection.release();

            });
    });
}
function create(userId, data, cb) {
       
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query('INSERT INTO `worknote` SET ?', data, (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            read(userId,res.insertId, cb);
            connection.release();
        });
    });
}

function read(userId, id, cb) {

    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `worknote` WHERE `id` = ? ', id, (err, results) => {
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
                connection.release();
            });
    });
}

function update(userId, id, data, cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'UPDATE `worknote` SET ? WHERE `id` = ?  and `createdById` = ?', [data, id, userId], (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                read(userId, id, cb);
                connection.release();
            });
    });
}
function updateGroupStatus(rootid, status) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'UPDATE `worknote` SET deptlog = ? WHERE id = ? or rootid= ? ', [status, rootid, rootid], (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                connection.release();
            });
    });
}
function _delete(userId,id, cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query('DELETE FROM `worknote` WHERE `id` = ?  and  `createdById` = ?',[ id, userId ],  cb);
        connection.release();
    });
}

module.exports = {
    createSchema: createSchema,
    list: list,
    listBy: listBy,
    listToNote:listToNote,
    listTimestampBy: listTimestampBy,
    listTimestampStatusBy:listTimestampStatusBy,
    listByParentid: listByParentid,
    listByKW: listByKW,
    updateGroupStatus: updateGroupStatus,
    create: create,
    read: read,
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
        if (err) {
            return;
        }
        createSchema(result);
    });
}

function createSchema(config) {
    const connection = mysql.createConnection(extend({
        multipleStatements: true
    }, config));

    connection.query(
        `CREATE DATABASE IF NOT EXISTS \`deptwork\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`bookshelf\`;
    CREATE TABLE IF NOT EXISTS \`deptwork\`.\`worknote\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NULL,
      \`author\` VARCHAR(255) NULL,
      \`authorname\` VARCHAR(255) NULL,
      \`toStaf\` VARCHAR(255) NULL,
      \`toName\` VARCHAR(255) NULL,
      \`logDate\` VARCHAR(255) NULL,
      \`description\` TEXT NULL,
      \`deptlog\` int(11) 0,
      \`scholog\` int(11) 0,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
      \`rootid\` INT UNSIGNED NULL,
      \`parentid\` INT UNSIGNED NULL,
    PRIMARY KEY (\`id\`));`,
        (err) => {
            if (err) {
                throw err;
            }
            console.log('Successfully created schema');
            connection.end();
        }
    );
}