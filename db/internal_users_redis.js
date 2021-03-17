var http = require('http');
var fs = require('fs');
var redis = require("redis"),
    client = redis.createClient();
var records = [{ id: 1, username: 'admin', password: '12567', displayName: 'admin', emails: [{ value: 'cool@mo' }], encode_username: "", marksys_flag: 0, marksys_info: null, Theme: 8 }];
function encode_key(x) {
    var d = new Date();
    var n = d.getDate();
    var res = String.fromCharCode(n + 64);
    if (n < 10) n = '0' + n;
    var n = n + res;
    return n + new Buffer.from(x).toString('base64');
}
exports.findById = function (id, cb) {
    process.nextTick(function () {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if ((record != null) && (record.id === id)) { return cb(null, record); }
        }
        client.hget("Users", id.toString(), function (err, result) {
            if (err) { cb(new Error('User ' + id + ' does not exist')); }
            let user = JSON.parse(result);
            records.push(user);
            return cb(null, user);
        }) //cb(new Error('User ' + id + ' does not exist'));
    });
}

exports.findByUsername = function (username, cb) {
    process.nextTick(function () {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.username === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
}

exports.updateUser = function (id, cb) {
    client.hget("Users", id.toString(), function (err, result) {
        if (err) { cb(new Error('User ' + id + ' does not exist')); }
        let user = JSON.parse(result);
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if ((record != null) && (record.id === user.id)) {
                records[i] = user;
                return cb('User ' + id + ' update');
            }
        }
        return cb('User ' + id + ' does not exist');
    })
}

exports.removeUser = function (id, cb) {
    for (var i = 0, len = records.length; i < len; i++) {
        var record = records[i];
        if ((record != null) && (record.id === id)) {
            records.splice(i, 1);
            return cb('User ' + id + ' remove');
        }
    }
    return cb('User ' + id + ' does not exist');
}

exports.findByUsernamePassword = function (username, password, cb) {
    process.nextTick(function () {
        Login8082API(username, password, cb);
    });
}

function ReadFromRedis(id, password) {
    return new Promise(resolve => {
        client.hget("Users", id.toString(), function (err, result) {
            if (err) { resolve(null); }
            else {
                let user = JSON.parse(result);
                resolve(user);
            }
        })
    });
}

async function LoginFromRedis(id, password, cb) {
    let redis_user = await ReadFromRedis(username, password);
    if (redis_user && redis_user.password == password) {
        let found = false;
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if ((record != null) && (record.id === redis_user.id)) {
                records[i] = redis_user;
                found = true;
            }
        }
        if (!found) records.push(redis_user);
        var d = new Date();
        console.log("logined", redis_user.id, d.toLocaleDateString(), d.toLocaleTimeString());
        return cb(null, redis_user);
    }
    else {
        return cb("login error", null);
    }
}
