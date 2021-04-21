'use strict';
const mysql = require('mysql');
const config = require('../../config');
const options = {
    host: config.get('ACTMYSQL_HOST'),
    user: config.get('ACTMYSQL_USER'),
    password: config.get('ACTMYSQL_PASSWORD'),
    database: config.get('ACTMYSQL_DATABASE')
};
const pool = mysql.createPool(options);

function list( userId , cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        // Use the connection
        connection.query(
            'SELECT * FROM `studinfo` order by stud_ref DESC ',[],
            (err, results) => {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, results);
                connection.release();
            }
        );
    });
}
function listMore( limit,  token, cb) {
    token = token ? parseInt(token, 10) : 0;
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT *  FROM `studinfo` order by stud_ref DESC LIMIT ? OFFSET ?', //, DAYOFWEEK(logDate)-1 dw
            [ limit, token],
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
function listBy(id, limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `studinfo` where stud_ref = ? order by stud_ref desc  LIMIT ? OFFSET ?',
            [ id,limit, token],
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

function create( data, cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query('INSERT INTO `studinfo` SET ? ', [data], (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            //read( res.insertId, cb);
            read( data.stud_ref, cb);
            //read(res.insertId, cb);
            //cb(null);
            connection.release();
        });
    });
}

function read( id, cb) {

   // console.log(id);
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'SELECT * FROM `studinfo` WHERE `stud_ref` = ? ', id, (err, results) => {
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
function update( id, data, cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query(
            'UPDATE `studinfo` SET ? WHERE `stud_ref` = ?  ', [data, id], (err) => {   //and `createdById` = ?
                if (err) {
                    cb(err);
                    return;
                }
                read(id, cb);
                connection.release();
            });
    });
}

function _delete(id ,cb) {
    pool.getConnection(function (err, connection) {
        if(err){cb(err);return;}
        connection.query('DELETE FROM `studinfo` WHERE `stud_ref` = ? ',[ id ],  cb);
        connection.release();
    });
}

function ReadStafbyId(STAFID,cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `studinfo` WHERE stud_ref=?;', [STAFID], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
module.exports = {
    createSchema: createSchema,
    list: list,
    listMore: listMore,
    create: create,
    read: read,
    listBy: listBy,
    update: update,
    delete: _delete,
    ReadStafbyId:ReadStafbyId
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
/*
CREATE TABLE `studinfo` (
  `stud_ref` varchar(11) COLLATE utf8mb4_bin NOT NULL,
  `dsej_ref` varchar(11) COLLATE utf8mb4_bin DEFAULT NULL,
  `c_name` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  `curr_class` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  `curr_seat` int(11) DEFAULT NULL,
  `key_md` varchar(4) COLLATE utf8mb4_bin DEFAULT NULL,
  `classmaster` int(11) DEFAULT NULL,
  `grp` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  `sect` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  `posi` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  `idx` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`stud_ref`),
  KEY `cno_seat` (`curr_class`,`curr_seat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
*/
function createSchema(config) {
   
    const connection = mysql.createConnection(extend({
        multipleStatements: true
    }, config));

    connection.query(
   `CREATE DATABASE IF NOT EXISTS \`joehong\`
    DEFAULT CHARACTER SET = 'utf8'
    DEFAULT COLLATE 'utf8_general_ci';
    USE \`joehong\`;
  CREATE TABLE \`studinfo\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NULL,
      \`author\` VARCHAR(255) NULL,
      \`publishedDate\` VARCHAR(255) NULL,
      \`newstxt\` VARCHAR(255) NULL,
      \`description\` TEXT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
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