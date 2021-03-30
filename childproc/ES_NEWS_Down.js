'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const querystring = require('querystring');
const http = require('http');
const config = require('../config');
const mysql = require('mysql');
const options = {
    host: config.get("MYSQL_NEWS_host"),
    user: config.get("MYSQL_NEWS_user"),
    password: config.get("MYSQL_NEWS_password"),
    database: config.get("MYSQL_NEWS_db"),
};
const conn = mysql.createConnection(options);
const API_SP_TOKEN=config.get("API_SP_TOKEN");

async function HttpGet(host_, path_ ) {
    let http_proc = http;
    let port_=80;
    return new Promise(resolve => {
        http_proc.get(
        {
            hostname: host_,
            port: port_,
            path: path_,
            method: 'GET',
        },
        (res) => {
            res.setEncoding('utf8');
            let rawData='';
            res.on('data', (chunk) => { rawData+= chunk; });
            res.on('end', () => { resolve(rawData); });
        }).on('error', (e) => { console.error(e); });
    });
}
//http://mail.mbc.edu.mo/news/item/plain/1?category=%E4%BF%A1%E6%81%AF
let p1=new Promise(async function (resolve, reject)  {
    let cnt=0;
    for(let i=1;i<10;i++)
    {
        let data=await HttpGet("mail.mbc.edu.mo", `/news/item/plain/${i}?category=%E4%BF%A1%E6%81%AF`, "sid", 80 )
        data=JSON.parse(data)
        cnt += await new Promise((resolve, reject) => {
            conn.query(
                "update items set ? where iid=?;",[data,data.iid],
                async function (err, results) {
                    if (err) {
                        console.log(err);return;
                    }
                    console.log(results)
                       resolve(100);                 
                }
              );
        });
        console.log(cnt)
        if(cnt==900){ resolve(); }
    }
});    

p1.then(function(){   conn.end();  console.log("end")} );

return;

