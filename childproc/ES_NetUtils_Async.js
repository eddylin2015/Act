'use strict';
const http = require('http');
const https = require('https');

const fs = require('fs');
module.exports={
    html2txt:html2txt,
    Auth_Login:Auth_Login,
    HttpGet:HttpGet,
    HttpPost:HttpPost,
    GetURL_DownFile:GetURL_DownFile
}
function html2txt(html)
{
	html = html.replace(/<!--([\w|\W|\s|\S]*?)-->/gi, '');					
	html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
	html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
	html = html.replace(/<\/div>/ig, '\n');
	html = html.replace(/<\/li>/ig, '\n');
	html = html.replace(/<li>/ig, '  *  ');
	html = html.replace(/<\/ul>/ig, '\n');
	html = html.replace(/<\/p>/ig, '\n');
	html = html.replace(/<br\s*[\/]?>/gi, "\n");
	html = html.replace(/<[^>]+>/ig, '');
	html = html.replace(/&nbsp;/ig, ' ');
	html = html.replace(/<!--([\w|\W|\s|\S]*?)-->/gi, '');	
	return html;
}
function Auth_Login(host_, path_, param_postData, port_) {
    return new Promise(resolve => {
        let http_proc = http;
        let http_https_="http";
        if(port_==443 || port_==8080){ 
            http_https_="https";
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            http_proc = https ;
        }else{
            port_=80;
        }
        let Origin_=http_https_+"://"+host_;
        console.log(Origin_+path_,param_postData);
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
                    'Cookie': 'session_id=714b232ee2cbdc32bf66ffff226b7b4388026a8c'
                }
            }
            , (res) => {
                res.on('data', (d) => {
                    //console.log(d.toString());
                    //console.log(res.headers);                    
                    resolve(res.headers['set-cookie'][0].split(";")[0]); 
                });
            });
        req.write(param_postData);
        req.end();
    });
}



function HttpGet(host_, path_, sid, port_ ) {
    let http_proc = http;
    let http_https_="http";
    if(port_==443 || port_==8080){ 
        http_https_="https";
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        http_proc = https ;
    }else{
        port_=80;
    }
    let Origin_=http_https_+"://"+host_;
    //console.log(Origin_+path_);

    return new Promise(resolve => {
        http_proc.get(
        {
            hostname: host_,
            port: port_,
            path: path_,
            method: 'GET',
            headers: { 'Cookie': sid }
        },
        (res) => {
            res.setEncoding('utf8');
            let rawData='';
            res.on('data', (chunk) => { rawData+= chunk; });
            res.on('end', () => {
                //console.log(rawData); 
                resolve(rawData);
            });
        }).on('error', (e) => { console.error(e); });
    });
}


function HttpPost(host_, path_, param_postData,sid, port_) {
    return new Promise(resolve => {
        let http_proc = http;
        let http_https_="http";
        if(port_==443 || port_==8080){ 
            http_https_="https";
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            http_proc = https ;
        }else{
            port_=80;
        }
        let Origin_=http_https_+"://"+host_;
        //console.log(Origin_+path_,param_postData);
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
                    'Cookie': sid
                }
            }
            , (res) => {
                res.setEncoding('utf8');
                let rawData='';
                res.on('data', (chunk) => { rawData+=chunk; });
                res.on('end', () => { 
                    //console.log(" start wait ...");
                    resolve(rawData); 
                });
            });
        req.write(param_postData);
        req.end();
    });
}
function GetURL_DownFile(host_, path_, sid, fn) {
    return new Promise(resolve => {
    http.get(
        {
            hostname: host_,
            port: 80,
            path: path_,
            method: 'GET',
            headers: { 'Cookie': sid }
        },
        (res) => {
            res.setEncoding('utf8');
            let rawData='';
            res.on('data', (chunk) => { rawData+=chunk; });
            res.on('end', () => { 
                if(res.statusCode==404){ resolve(fn + ": Not File!"); }
                else{
                   fs.writeFile(fn, rawData, (err) => { if (err) throw err;});
                   resolve(fn + ": Save File!");
                }
            });
        }).on('error', (e) => { console.log(e);  });
    });
}