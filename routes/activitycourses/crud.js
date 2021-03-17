'use strict';
const express = require('express');
const images = require('./images');
const http = require('http');
const redis = require("redis");
const client = redis.createClient();
const netutils = require('../../lib/net_utils');

function getModel() { 
    return require(`./model-mysql-pool_act`); 
}

function authRequired(req, res, next) {
    let act_c_id = req.params.book;
    let fn = req.query.fn? req.query.fn:"";
    console.log(act_c_id,fn)
    console.log(req.session.al_pass)
    if (req.user) {
        req.session.al_pass=act_c_id
    }
    if (!req.session.al_pass )
    {
        return res.redirect(`/internal/activitycourses/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    if( req.session.al_pass!=act_c_id)
    {
        return res.redirect(`/internal/activitycourses/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    /*
    if (!req.user) {
        req.session.oauth2return = req.originalUrl;
        //return res.redirect('/auth/login');
        return res.redirect('/login');
    }else if("2002024,2012008,2012020".indexOf(req.user.id)==-1){
        return res.end(`${req.user.id}please auth required for Activity Course Register Attendence !`);
    }
    */
    next();
}

const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/', (req, res, next) => {
    getModel().ReadActDef( (err, entity) => {
        if (err) { next(err); return; }
        res.render('activitycourses/index.pug', {
            profile: req.user,
            books: entity,
        });
    });
});  
router.get('/al_list/:book',authRequired,  (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn? req.query.fn:"";
    getModel().ReadActLessons(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        res.render('activitycourses/al_list.pug', {
            profile: req.user,
            books: entity,
            fn:fn,
        });
    });
});  
router.get('/al_list/:book/add',authRequired,  (req, res, next) => {
});  
router.post('/al_list/:book/add',authRequired,  (req, res, next) => {
});  
router.get('/al_list/:book/form/:alid',authRequired,  (req, res, next) => {
});  
router.post('/al_list/:book/form/:alid',authRequired,  (req, res, next) => {
});  


router.get('/al_login/:book',  (req, res, next) => {
    let act_c_id = req.params.book;
    let act = req.query.fn;
    res.render('activitycourses/al_login.pug', {
        profile: req.user,
        act_c_id:act_c_id,
        act:act
    });
});  
router.post('/al_login/:book',  images.multer.single('image'),  (req, res, next) => {
    let act_c_id = req.body.ActID;
    let fn = req.body.Act;
    req.session.al_pass=act_c_id
    console.log("####")
    console.log(req.session.al_pass)
    console.log("####")
    return res.redirect(`/internal/activitycourses/al_list/${act_c_id}?fn=${encodeURI(fn)}`);
});  

router.get('/cnolist', authRequired, (req, res, next) => {
    res.render('markup/actmng/cnolist.pug', {
        profile: req.user,
        esess: req.user.marksys_info[0][0],
        sid:GetSID(req),
        sect:req.query.cno,
    });
});  

router.get('/actlist',authRequired, (req, Response, next) => {
    let aot = GetAOT(req);
    let sid= GetSID(req);
    let cno = 'actcid';
    let staf_ref = netutils.id2staf(req.user);
    getModel().ReadActDef( (err, entity) => {
        if (err) { next(err); return; }
        Response.render('markup/actmng/editActList.pug', {
            profile: req.user,
            fn:  `${cno}_act`,
            cno: cno,
            books: entity,
            editable: req.query.r,
            aot: aot,
            sid: sid
        });
    });
});

router.post('/actlistUpdate',authRequired, images.multer.single('image'), (req, Response, next) => {
    let staf = req.user ? req.user.id : null;
    let aot = req.query.aot;
    let sid= GetSID(req);
    let data=JSON.parse(req.body.datajson)
        getModel().UpdateActDef(data, (err, entity) => {
            if (err) { next(err); return; }
            Response.end(`更新${entity}筆...`);
        });
});

router.get('/actGrade/:book/edit',authRequired, (req, Response, next) => {
    let aot = GetAOT(req);
    let sid= GetSID(req);
    let cno = req.params.book;
    let actcid=cno;
    let staf_ref = netutils.id2staf(req.user);
    getModel().ReadActivebyACTCID( actcid, (err, entity) => {
        if (err) { next(err); return; }
        Response.render('markup/actmng/editAct.pug', {
            profile: req.user,
            fn: `${cno}_act`,
            cno: req.params.book,
            books: entity,
            editable: req.query.r,
            aot: aot,
            sid:sid
        });
    });
});
////

router.get('/studGrade/:book/edit',authRequired, (req, Response, next) => {
    let aot = GetAOT(req);
    let sid= GetSID(req);
    let cno = req.params.book;
    let staf_ref = netutils.id2staf(req.user);
    getModel().readclassact(staf_ref, cno,sid, (err, entity) => {
        if (err) { next(err); return; }
        Response.render('markup/actmng/editAct.pug', {
            profile: req.user,
            fn: `${cno}_act`,
            cno: req.params.book,
            books: entity,
            editable: req.query.r,
            aot: aot,
            sid:sid
        });
    });
});

router.post('/studGradeUpdate',authRequired, images.multer.single('image'), (req, Response, next) => {
    let staf = req.user ? req.user.id : null;
    let aot = req.query.aot;
    let sid= GetSID(req);
    let data=JSON.parse(req.body.datajson)
    if ( data && (aot == 1 || aot == 2 || aot == 3)) {
        getModel().UpdateAct(data,sid,aot, (err, entity) => {
            if (err) { next(err); return; }
            Response.end(`第${aot}段, 更新${entity}筆...`);
        });
    } else {
        Response.end("Err");
    }
});

router.get('/regStud/:book',authRequired, (req, Response, next) => {
    let cno = req.params.book;
    let rurl = encodeURI(req.baseUrl);
    getModel().ReadClassStudAct(cno, (err, entity) => {
            if (err) { console.log(err);next(err); return; }
            Response.render('markup/actmng/regstud/studlist_act.pug', {
                profile: req.user,
                fn: cno,
                classno: cno,
                books: entity,
                rurl : rurl,
                jsontwolist_php:`markup_jsontwolist?cno=${cno}&fn=${encodeURI(cno)}`,
            });
        });
});

router.post('/regStud/markup_jsontwolist',authRequired, (req, Response, next) => {
    let cno=req.query.cno;
    let sid= GetSID(req);
    let act_c_id=900;
    let key1=req.body.aObj? req.body.aObj:null;
    let key2=req.body.rObj? req.body.rObj:null;
    getModel().RegStudAct(sid, cno,act_c_id, key1, key2 , (err, entity) => {
        if (err) { next(err); return; }        
        Response.end( entity.toString());
    });
});

function ExpArrayToXls(arraydata_str, exportfilename, respone) {
    let param_postData = arraydata_str;
    let options = {
        hostname: '127.0.0.1', port: 8082, path: '/api/NpoiXls/ExpArrayToXls', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(param_postData) }
    };
    let req = http.request(options, (res) => {
        respone.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        respone.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(exportfilename) + ";");
        res.on('data', (chunk) => { respone.write(chunk); }); res.on('end', () => { respone.end(); });
    });
    req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
    req.write(param_postData); req.end();
}

/**
 * Errors on "/studcourse/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});
module.exports = router;
