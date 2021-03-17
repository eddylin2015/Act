'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
/* GET home page. */

router.get('/internal/', function (req, res) {   
    //let msg={ cmd: 'notifyRequest', num:0 };    process.send(msg);
    var smu = require('./sidebar_menu_item');
    res.render('index', { title: '浸信中學教職員網頁 主頁',
    siteName:req.hostname, 
    profile: req.user, 
    mnu0: smu.m0, 
    mnu1: smu.m1, 
    mnu2: smu.m2, 
    mnu3: smu.m3, 
    mnu4: smu.m4,
    mnu_excu_dept:smu.mnu_excu_dept
   });
});
router.get('/internal/about', function (req, res) {
    res.render('about', { title: '浸信中學教職員網頁 關於', profile: req.user });
});
router.get('/internal/contact', function (req, res) {
    res.render('contact', { title: '浸信中學教職員網頁 聯絡方式', profile: req.user });
});
router.get('/internal/flashpage', function (req, res) {
    res.render('flashpage', { title: '浸信中學教職員網頁 關於', profile: req.user });
});
//
// Define routes.
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
      var hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  }
router.get('/internal/home',    function (req, res) {
        res.render('home', { profile: req.user   });
    });
router.get('/login',    function (req, res) {
        var d = new Date();
        var y = d.getFullYear() ;
        var m = d.getMonth()+1;
        var dd = d.getDate();
        let nowdate=y+ (m<10?"0":"")+m+ (dd<10?"0":"")+dd;
        let temp="";
        let ppuser="";
        let pppwd="";
        let ppdate="";
        if(req.query.r){
            pppwd=req.query.r;
            temp=pppwd.substring(3);
            temp=hex2a(temp);
            ppuser=temp.substring(0,7);
            ppdate=temp.substring(7,15);   
            if(ppdate != nowdate) pppwd="";
        }

        

        if(req.query.redirect){
            res.render('login',{redirect: req.query.redirect,puser:ppuser,ppwd:pppwd}); 
        }
        else{
           res.render('login');
        }
    });
router.get('/internal/login',    function (req, res) {
        res.render('login');
    });

router.get('/internal/logout',    function (req, res) {
        req.logout();
        res.redirect('/internal/');
    });

router.get('/internal/profile',
    function (req, res) {
        res.render('profile', {siteName:req.hostname, profile: req.user, profilestr: JSON.stringify(req.user) });
    });

var staticlogfile = function (filename, mimetype, res) {
    const fs = require('fs');
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }

        res.writeHead(200, { 'Content-Type': mimetype });
        res.write(data);
        return res.end();
    });
}
router.get('/internal/gs_gateway_log',
    function (req, res) {
        let mimetype = "text/plain";
        let filename = "c:/code/sslweb/gsuite_gmail_inboundgateway_mailrelayserver_log.txt";
        staticlogfile(filename, mimetype, res);
    });
router.get('/internal/smtp_helo_domain_log',
    function (req, res) {
        let mimetype = "text/plain";
        let filename = "c:/code/coolmail2/mlogdomain.txt";
        staticlogfile(filename, mimetype, res);
    });
//
module.exports = router;
