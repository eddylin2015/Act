'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const querystring = require('querystring');
const http = require('http');
const https = require('https');
const config = require('../config');


function HttpPost(host_, path_, param_postData,sid, port_) {
    return new Promise(resolve => {
        let http_proc = http;let http_https_="http"; port_=80;
        let Origin_=http_https_+"://"+host_;
        const req = http_proc.request(
            {
                hostname: host_,
                port: port_,
                path: path_,
                method: 'POST',
                headers: {
                    'Connection': 'keep-alive',
                    'Content-Length': Buffer.byteLength(param_postData),
                    'Cache-Control': 'max-age=0',
                    'Origin': Origin_ ,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4',
                }
            }
            , (res) => {
                res.setEncoding('utf8');
                let rawData='';
                res.on('data', (chunk) => { rawData+=chunk; });
                res.on('end', () => { 
                    console.log(rawData)
                    console.log(" start wait ...");
                    resolve(1);
                });
            });
        req.write(param_postData);
        req.end();
    });    
}
const API_SP_TOKEN=config.get("API_SP_TOKEN");
const mysql = require('mysql');
var fs = require('fs');
const workgrid_options = {
    host: config.get("MYSQL_NEWS_host"),
    user: config.get("MYSQL_NEWS_user"),
    password: config.get("MYSQL_NEWS_password"),
    database: config.get("MYSQL_NEWS_db"),
};
const conn = mysql.createConnection(workgrid_options);
const weeks = 1;
let curdate=new Date(Date.now()).toISOString().substring(0, 10);
let end_d = (new Date(Date.now() + 3600 * 24 * 7000 * weeks));
let enddate=end_d.toISOString().substring(0, 10);
console.log(enddate)
const mail_cfg =
{
    Auth_Login_Host: config.get("NEWS_SYNC_Login_Host"),
    Auth_Login_port: 80,
}
let sid="'"
let cnt=0
async function UpdateMarkArr() {
        cnt += await new Promise((resolve, reject) => {
                conn.query(
                    "SELECT * FROM items ;",[ ],
                    async function (err, results) {
                        if (err) {
                            console.log(err);return;
                        }
                        for(let i=0;i<results.length;i++)//results.length;i++)
                        {
                           let post_data_=(querystring.stringify(results[i]));
                           let link_path_ =(`/news/sync/item/${results[i].iid}?token=${API_SP_TOKEN}`);
                           await HttpPost(mail_cfg.Auth_Login_Host, link_path_, post_data_, sid, mail_cfg.Auth_Login_port);   
                           resolve(100);                 
                        }
                    }
                  );

        });

}
UpdateMarkArr() 
conn.end();
console.log("end")
return;

