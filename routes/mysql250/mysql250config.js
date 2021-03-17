const config = require('../../config');
const options = {
    host: config.get('MYSQL_250_host'),
    user: config.get('MYSQL_250_user'),
    password: config.get('MYSQL_250_password'),
    database: 'eschool',
    multipleStatements: true,
    connectionLimit: 30,
    //acquireTimeout: 50000
};
const mysql = require('mysql');
const esdbPool = mysql.createPool(options);
//esdbPool.on('acquire', function (connection) { console.log(' esdbPool Connection %d acquired', connection.threadId);});
//esdbPool.on('connection', function (connection) { /*connection.query('SET SESSION auto_increment_increment=1')*/});
//esdbPool.on('enqueue', function () { console.log('Waiting for available connection slot');});
//esdbPool.on('release', function (connection) { console.log('Connection %d released', connection.threadId);});

module.exports = {
    mysql250options: options,
    esdbPool: esdbPool
};
