var http = require('http');
var fs = require('fs');
var records = [ { id: 1, username: 'admin', password: '12567', displayName: 'admin', emails: [{ value: 'admin@mo' }], encode_username: "", marksys_flag: 0, marksys_info:null }];
function encode_key(x) {
    var d = new Date();
    var n = d.getDate();
    var res = String.fromCharCode(n+64);
    if (n < 10) n = '0' + n;
    var n = n + res;
    return n + new Buffer.from(x).toString('base64');
}
saveUserCache = function () {
    fs.writeFile(process.cwd() + "/UserCache.dat", JSON.stringify(records), (err) => {
        if (err) throw err;
        //console.log('The file has been saved!');
    });   
}
loadUserCache = function () { records = JSON.parse(fs.readFileSync(process.cwd() + "/UserCache.dat"));}
showUserCache = function () {}
exports.saveUserCache = saveUserCache;
exports.loadUserCache = loadUserCache;
exports.findById = function (id, cb) {
    process.nextTick(function () {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.id === id) {
                return cb(null, record);
            }
        }
        cb(new Error('User ' + id + ' does not exist'));
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
