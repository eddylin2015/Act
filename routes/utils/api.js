// GridStafEval
'use strict';
const express = require('express');
const http = require('http');
const querystring = require('querystring');
const netutils = require('../../lib/net_utils');
function GetSID(req) { return (req.user && req.user.marksys_info) ? req.user.marksys_info[0][0].session_id : null; }
/*
get  /utils/
post  /utils/stafeval_save.php
post  /utils/expxls
*/
const router = express.Router();

router.get('/', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    res.end("/utils/expxls/utils/expxlsfile:/book");
});
router.post('/expxls', (req, res) => {
    let data = req.body;
    ExpArrayToXls(data.CSVFrmPOSTNAME, "staf_grid_eval_data.xls", res);
});
router.post('/expxlsfile/:book', (req, res) => {
    let data = req.body;
    ExpArrayToXls(data.CSVFrmPOSTNAME, req.params.book + ".xls", res);
});
function ExpArrayToXls(arraydata_str, exportfilename, respone) {
    let param_postData = arraydata_str;
    console.log("ExpArrayToXls")
    let options = {
        hostname: '127.0.0.1', port: 8082,
        path: '/api/NpoiXls/ExpArrayToXls',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(param_postData)
        }
    };
    let req = http.request(options, (res) => {
        respone.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        respone.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(exportfilename) + ";");
        res.on('data', (chunk) => { respone.write(chunk); });
        res.on('end', () => {
            respone.end();
        });
    });
    req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
    req.write(param_postData);
    req.end();
}

router.get('/jsontogrid', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    //res.end("/utils/expxls/utils/expxlsfile:/book");
    res.render('utils/jsontogrid.pug', {
        profile: req.user,
    });
});
function Text2TitleArr(JSONTEXT)
    {
        try{
        var atitle=new Array();
        var jobj=JSON.parse(JSONTEXT);   
        var aobj=new Array();
        aobj.push(atitle);
        if(Array.isArray(jobj)){
            for(let i=0;i<jobj.length;i++){
               let obj=jobj[i];
               let ra=new Array();
               if(Array.isArray(obj)){
                   for(let j=0;j<obj.length;j++){ ra.push(obj[j]); }
               }else{
                   for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                             if(!atitle.includes(key)){
                                 atitle.push(key);
                                 }
                             ra[atitle.indexOf(key)]=obj[key];
                        }
                    }
                }
                aobj.push(ra);
            }        
        }else{
            let ra=new Array();
            for (var key in jobj) {
                if (jobj.hasOwnProperty(key)) {
                    ra.push(key);
                    ra.push(jobj[key]);
                }
            }
            aobj.push(ra);
        }
        return aobj;
        }catch(e){
            alert(e);
        }
        return null;
    }    
function Text2Arr(JSONTEXT)
{
    try{
    var jobj=JSON.parse(JSONTEXT);   
    var aobj=new Array();
    if(Array.isArray(jobj)){
        for(let i=0;i<jobj.length;i++){
           let obj=jobj[i];
           let ra=new Array();
           if(Array.isArray(obj)){
               for(let j=0;j<obj.length;j++){ ra.push(obj[j]); }
           }else{
               for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                         ra.push(key);
                         ra.push(obj[key]);
                    }
                }
            }
            aobj.push(ra);
        }        
    }else{
        let ra=new Array();
        for (var key in jobj) {
            if (jobj.hasOwnProperty(key)) {
                ra.push(key);
                ra.push(jobj[key]);
            }
        }
        aobj.push(ra);
    }
    return aobj;
    }catch(e){
        alert(e);
    }
    return null;
}
router.post('/jsontogrid', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {

    if(req.body.fmt=="xlstitle"){
        var aobj =Text2TitleArr(req.body.JSONTEXT) ;
        if(aobj==null){
            res.end("null");
        }else{
        let exportfilename="JSON2XLS.xls";
        ExpArrayToXls(JSON.stringify(aobj),exportfilename ,res)
        }
    }else{
        var aobj =Text2Arr(req.body.JSONTEXT) ;
        if(aobj==null){
            res.end("null");
        }
        else if(req.body.fmt=="xls"){
            let exportfilename="JSON2XLS.xls";
            ExpArrayToXls(JSON.stringify(aobj),exportfilename ,res)
        }else{
            res.write("<table border=1>")
            for(let i=0;i<aobj.length;i++){
                res.write("<tr>")
                for(let j=0;j<aobj[i].length;j++){
                    if(aobj[i][j]==undefined )  
                    {
                        res.write(`<td>null`)
                    }
                    else{
                    res.write(`<td>${aobj[i][j]}`)
                    }
                }    
            }
            res.write("</table>")
            res.end();
        }
    }

    
    //res.end("JSON.stringify(aobj)");
    //res.end(req.body.JSONTEXT);
    //let exportfilename="JSON2XLS.xls";
    //ExpArrayToXls(req.body.JSONTEXT,exportfilename ,res)
});
/**
 * Errors on "/books/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});
module.exports = router;