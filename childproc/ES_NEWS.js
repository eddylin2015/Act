'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const querystring = require('querystring');
const http = require('http');
const config = require('../config');
function HttpPost(host_, path_, PostData_, sid) {
    return new Promise(resolve => {
        const req = http.request(
            {
                hostname: host_,
                path: path_,
                port: 80,
                method: 'POST',
                headers: {
                    'Connection': 'keep-alive',
                    'Content-Length': Buffer.byteLength(PostData_),
                    'Cache-Control': 'max-age=0',
                    'Origin': "http://" + host_,
                    'Upgrade-Insecure-Requests': 1,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4',
                }
            }
            , (res) => {
                let rawData = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    console.log(rawData); console.log(" start wait ...");
                    resolve(1);
                });
            });
        req.write(PostData_);
        req.end();
    });
}
const API_SP_TOKEN = config.get("API_SP_TOKEN");
const mysql = require('mysql');
const options = {
    host: config.get("MYSQL_NEWS_host"),
    user: config.get("MYSQL_NEWS_user"),
    password: config.get("MYSQL_NEWS_password"),
    database: config.get("MYSQL_NEWS_db"),
};
const conn = mysql.createConnection(options);
let cnt = 0
async function UpdateNewsItems() {
    cnt += await new Promise((resolve, reject) => {
        conn.query("SELECT * FROM items ;", [],
            async function (err, results) {
                if (err) { console.log(err); return; }
                for (let i = 0; i < results.length; i++) {
                    let link_ = (`/news/sync/item/${results[i].iid}?token=${API_SP_TOKEN}`);
                    await HttpPost(config.get("NEWS_SYNC_Login_Host"), link_, querystring.stringify(results[i]), "sid");
                    resolve(100);
                }
            }
        );
    });
}
UpdateNewsItems();
conn.end();
console.log("end")
return;

