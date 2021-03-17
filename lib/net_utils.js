const http = require('http');
const querystring = require('querystring')
const zlib = require('zlib');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');
const PHP_HOST= config.get('PHP_HOST');
const PHP_PORT= config.get('PHP_PORT');

function rev_proxy(_port,req,res){
    //respone.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(exportfilename) + ";");
    console.log(req.headers);
    console.log(req.path);
    console.log(req.headers);
    const options = {
      port: _port,
      host: '127.0.0.1',
      headers:  req.headers,
      path:req.path,
      //headers:{"Content-Type":req.headers["content-type"]}
    };
    if(req.method=="GET"){
      const proxyReq = http.request(options );
      proxyReq.on('response', function(proxyRes) {
      res.setHeader("Content-Type",proxyRes.headers["content-type"]);
      if(proxyRes.headers["content-type"]=="application/vnd.ms-excel"||proxyRes.headers["content-type"]=="application/vnd.ms-word")
      {
        res.setHeader("Content-Disposition",proxyRes.headers["Content-Disposition"]);
      }
      proxyRes.pipe(res);
    });
    proxyReq.end();
    }
    else if(req.method=="POST")
    {
      options.headers={"Content-Type":req.headers["content-type"],"Content-Length":req.headers["content-length"]}
      const proxyReq = http.request(options );
      proxyReq.on('response', function(proxyRes) {
        res.setHeader("Content-Type",proxyRes.headers["content-type"]);
        if(proxyRes.headers["content-type"]=="application/vnd.ms-excel"||proxyRes.headers["content-type"]=="application/vnd.ms-word")
        {
          res.setHeader("Content-Disposition",proxyRes.headers["Content-Disposition"]);
        }
        proxyRes.pipe(res);
      });
      proxyReq.end(req.body);
    }
  }

  function HttpPost(param_host, param_path, param_postData, respone) {
    let options = {
        hostname: param_host, port: PHP_PORT,
        path: param_path, method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(param_postData) }
    };
    let req = http.request(options, (res) => {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => { respone.end(rawData); });
    });
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(param_postData);
    req.end();
}
function HttpGet(param_host, param_path, Response) {
    http.get(
        {
            hostname: param_host, port: PHP_PORT,
            path: param_path, method: 'GET',
            headers: { 'Cookie': 'this.session_id' }
        },
        (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => { Response.end(rawData); });
        }).on('error', (e) => {
            console.log(e);
        });
}
var ASCIIcodepage = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': 'A', '11': 'B',
    '12': 'C', '13': 'D', '14': 'E', '15': 'F', '16': 'G', '17': 'H', '18': 'J', '19': 'K', '20': 'L', '21': 'M', '22': 'N', '23': 'P', '24': 'Q',
    '25': 'R', '26': 'S', '27': 'T', '28': 'U', '29': 'W', '30': 'X', '31': 'Y'
}
function GetKey() {
    //ymddhha0a1a2
    var d = new Date();
    var y = ASCIIcodepage[d.getFullYear() % 100 - 12];
    var m = ASCIIcodepage[d.getMonth()];
    var dd = ASCIIcodepage[d.getDate()];
    var hh = ASCIIcodepage[d.getHours()];
    var hrs = d.getMinutes() * 60 + d.getSeconds();
    var a0 = ASCIIcodepage[Math.floor(hrs / 900)];
    var a1 = ASCIIcodepage[Math.floor(hrs % 900 / 30)];
    var a2 = ASCIIcodepage[hrs % 30];
    return "" + y + m + dd + hh + a0 + a1 + a2;
}
function id2staf(user) {
    if (user) {
        let staf_ref = user.id.toString();
        if (staf_ref.length == 7) { staf_ref = staf_ref.substring(0, 4) + "-" + staf_ref.substring(4); }
        return staf_ref;
    } else { return "null"; }
}
function id2classno(user) { if (user && user.marksys_info) {let euser = user.marksys_info[1][0]; return euser.classno;} else { return "null"; }}
function id2uid(user) {if (user) {let staf_ref = user.id.toString();return staf_ref;} else { return "null"; }}
function id2uname(user)
{
    if (user)
    {
        let staf_ref = user.username;
        return staf_ref;
    } else { return "null"; }
}
function id2sid(user) {if (user && user.marksys_info) { return user.marksys_info[0][0].Session_id } else { return -1;}}
function id2session(user) {if (user && user.marksys_info) { return user.marksys_info[0][0].session } else { return -1;}}
function id2sessiondesc(user) {if (user && user.marksys_info) { return user.marksys_info[0][0].session_desc } else { return -1;}}
function id2pdate(user,x) 
{
    if (user && user.marksys_info) { 
        switch(x){
        case "1":  return user.marksys_info[0][0].date1 ;break;
        case "2":  return user.marksys_info[0][0].date2 ;break;
        case "3":  return user.marksys_info[0][0].date3 ;break;
        default: return fmt_now(0);
        }
    } else { return fmt_now(0);}
}

function fmt_date(d) {
    var y = d.getFullYear(); var m = d.getMonth() + 1; var d_ = d.getDate();
    return dstr = y + "-" + (m < 10 ? "0" : "") + m + "-" + (d_ < 10 ? "0" : "") + d_;
}

function fmt_now(intdays = 0) {
    var d = new Date();
    if (Math.abs(intdays) > 0) { d = new Date(new Date() - intdays * 3600 * 1000 * 24); }
    var y = d.getFullYear(); var m = d.getMonth() + 1; var d_ = d.getDate();
    return dstr = y + "-" + (m < 10 ? "0" : "") + m + "-" + (d_ < 10 ? "0" : "") + d_;
}
function fmt_time() {
    var d = new Date();
    return dstr = fmt_now() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds()
}
function readend_downlaod(request,resp,rawData,exportfilename)
{
    fs.readFile(rawData, function (err, content) {
        if (err) {
            resp.writeHead(400, { 'Content-type': 'text/html' });
            console.error(err);
            resp.end("No such file");
        }
        else {
            resp.setHeader('Content-disposition', 'attachment; filename=' + encodeURI(exportfilename));
            resp.end(content);
        }
    });
}
function stream_download(request,resp,rawData,exportfilename)
{
    resp.setHeader("Content-type", "application/vnd.ms-word");
    resp.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(exportfilename) + ";");
    fs.createReadStream(rawData).pipe(resp);
}
function gzip_downlaod(request,resp,rawData,exportfilename){
    console.log(rawData);
            let filename = rawData;//.toString().replace(/\W+/, '');
            try {
                if (fs.existsSync(filename)) {
                    resp.setHeader("Content-type", "application/vnd.ms-word");
                    resp.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(exportfilename) + ";");
                    let gzip_flag=true;
                    if(!gzip_flag){
                        fs.createReadStream(filename).pipe(resp);
                    }else{
                        let raw = fs.createReadStream(filename);
                        let acceptEncoding = request.headers['accept-encoding'];
                        if (!acceptEncoding) { acceptEncoding = '';  }
                        if (/\bgzip\b/.test(acceptEncoding)) {
                            resp.writeHead(200, { 'Content-Encoding': 'gzip' });
                          raw.pipe(zlib.createGzip()).pipe(resp);
                        } else if (/\bdeflate\b/.test(acceptEncoding)) {
                            resp.writeHead(200, { 'Content-Encoding': 'deflate' });
                          raw.pipe(zlib.createDeflate()).pipe(resp);
                        } else  {
                            resp.writeHead(200, {});
                          raw.pipe(resp);
                        }
                    }
                } else {
                    resp.writeHead(404, { 'Content-Type': 'text/html' });
                    return resp.end("404 Not Found");
                }
            } catch (err) { console.log(err); }
}

function getClientIP(req){
    let ip=req.headers['x-forwarded-for']|| 
    req.connection.remoteAddress ||
    req.socket.remoteAddress||
    req.connection.socket.remoteAddress;
    let cip=ip.split(":").pop();
    return cip;
}

function encClientInfoMD5(cip,userid){
    let encip= crypto.createHash('md5').update(cip).digest('hex');
    let userhex=Number(userid).toString(16)+'000000';
    let fmtnow=Number(fmt_now().replace(/\D/g,'')).toString(16);
    return fmtnow+userhex.substring(0,6)+encip;
}

function decClientInfoMD5(MD5){
    let ip=req.headers['x-forwarded-for']|| 
    req.connection.remoteAddress ||
    req.socket.remoteAddress||
    req.connection.socket.remoteAddress;
    let cip=ip.split(":").pop();
    let encip= crypto.createHash('md5').update(cip).digest('hex');
    let userhex=Number(req.user.id).toString(16)+'000000';
    let fmtnow=Number(fmt_now().replace(/\D/g,'')).toString(16);
    return fmtnow+userhex.substring(0,6)+encip;
}

function getClientInfoMD5(req){
    return encClientInfoMD5(getClientIP(req),req.user.id);
}


module.exports = {
    rev_proxy:rev_proxy,
    HttpPost: HttpPost,
    HttpGet: HttpGet,
    id2staf: id2staf,
    id2classno: id2classno,
    id2uid: id2uid,
    id2uname: id2uname,
    id2sid:id2sid,
    id2session:id2session,
    id2sessiondesc:id2sessiondesc,
    id2pdate:id2pdate,
    fmt_now: fmt_now,
    fmt_date: fmt_date,
    fmt_time: fmt_time,
    gzip_downlaod:gzip_downlaod,
    readend_downlaod:readend_downlaod,
    stream_download:stream_download,
    getClientIP:getClientIP,
    getClientInfoMD5:getClientInfoMD5,
    encClientInfoMD5:encClientInfoMD5,
    decClientInfoMD5:decClientInfoMD5,
};
