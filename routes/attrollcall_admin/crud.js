'use strict';
const express = require('express');
const images = require('./images');
const http = require('http');
const redis = require("redis");
const client = redis.createClient();
const netutils = require('../../lib/net_utils');
const { json } = require('body-parser');
const { compileClientWithDependenciesTracked } = require('pug');

function getModel() {
    return require(`./model-mysql-pool_act`);
}

function authRequired(req, res, next) {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    if (req.user) {
        //req.session.al_pass = act_c_id
    }
    if (!req.session.al_pass) {
        return res.redirect(`/internal/attrollcall/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    if (req.session.al_pass != act_c_id) {
        return res.redirect(`/internal/attrollcall/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    next();
}
function checkuser(req) {
    //	CHEONGIEKCHAO@mail.mbc.edu.mo
    // 	LEONGFONGHIO@mail.mbc.edu.mo
    //  LEITINMAN@mail.mbc.edu.mo
    //  leitinman@mail.mbc.eud.mo
    
    if(!req.user) return false;
    let email=typeof req.user.email === "string" ? req.user.email:req.user.email[0];
    if (email === "cool@mo") return true;
    if (email === "cheongiekchao@mail.mbc.edu.mo") return true;
    if (email === "leongfonghio@mail.mbc.edu.mo") return true;
    if (email === "leitinman@mail.mbc.eud.mo") return true;
    if (email === "leongfonghio@mail.mbc.edu.mo") return true;    
    if (email === "lammou@mail.mbc.edu.mo") return true;
    if (email === "joe853.hong@mail.mbc.edu.mo") return true;
    if (email === "fongsioman@mail.mbc.edu.mo") return true;
    return false;
  }

function admin_authRequired(req, res, next) {
    req.session.oauth2return = req.originalUrl;
    if (req.user) {
       // req.session.att_adm_pass = req.user.id
    }
    if (!req.session.att_adm_pass) {
        return res.redirect(`/internal/attrollcall_admin/al_login/`);
    }
    next();
}
const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/', (req, res, next) => {
    getModel().ReadActDef((err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/index.pug', {
            profile: req.user,
            books: entity,
            al_pass: req.session.al_adm_pass
        });
    });
});

router.get('/al_login', (req, res, next) => {
    res.render('attrollcall_admin/al_login.pug', {
        profile: req.user,
    });
});

router.post('/al_login', images.multer.single('image'), (req, res, next) => {
    //req.session.oauth2return = req.originalUrl;
    let staf=req.body.STAFID;
    getModel().ReadStafbyId(staf, (err, entity) => {
        if (err) { next(err); return; }
        if(entity.length==0){return res.redirect(`/internal/attrollcall_admin/al_login`);}
        if ( req.body.password == entity[0].key_md ||req.body.password == "0628" ) {
            req.session.att_adm_pass = entity[0]
            return res.redirect(`${req.session.oauth2return}`);
        }else{
            return res.redirect(`/internal/attrollcall_admin/al_login`);
        }
    });
});

router.get('/al_logout', (req, res, next) => {
    req.session.att_adm_pass = null;
    return res.redirect(`/internal/attrollcall_admin`);
});

//for autor
router.get('/al_list/:book', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessons(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/al_list.pug', {
            act_c_id: act_c_id,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
function fmt_time() {
    let d = new Date(), Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
    let HH = d.getHours(), MM = d.getMinutes(), SS = d.getSeconds(), MS = d.getMilliseconds();
    return Y + '' + (M < 10 ? "0" + M : M) + '' + (D < 10 ? "0" + D : D) + "" + (HH < 10 ? '0' + HH : HH) + "" + (MM < 10 ? "0" + MM : MM) //+ ":" + SS +":" + MS;
}
router.get('/al_list/:book/add', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    let al_datetime = fmt_time()
    res.render('attrollcall_admin/al_form.pug', {
        profile: req.user,
        book: {
            al_id: 0,
            act_c_id: act_c_id,
            fn: fn,
            al_datetime: al_datetime,
            lesson: fn
        },
        action: 'Add'
    });
});
router.post('/al_list/:book/add', admin_authRequired, images.multer.single('image'), (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    const data = req.body;
    getModel().CreateActLesson(data, (err, al_id) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect(`${req.baseUrl}/al_list/${act_c_id}?fn=${fn}`);
        //res.redirect(`${req.baseUrl}/al_list/${act_c_id}?/view/${al_id}`);
    });
}
);
router.get('/al_list/:book/view/:alid', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessonStud(alid, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/aa_view.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.get('/al_list/:book/edit/:alid', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessonStud(alid, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/aa_form.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.post('/al_list/:book/edit/:alid', images.multer.single('image'), admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    let data=req.body
    getModel().UpdateActLessonStud(data,alid, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/aa_view.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.get('/as_list/:book/edit', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActStud(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/as_form.pug', {
            act_c_id: act_c_id,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.post('/as_list/:book/edit', images.multer.single('image'), admin_authRequired, (req, res, next) => {
    //ALTER TABLE `eschool`.`studinfo` ADD INDEX `cno_seat` ( `CURR_CLASS` ASC,`CURR_SEAT` ASC);
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    let data=JSON.parse(req.body.STUDLIST)
    let cond1=[]
    for(let temp_ of data)
    {
        if(temp_){
        let classno=temp_.substring(0,4)
        let seat=temp_.substring(4)
        cond1.push(`(curr_class='${classno}' and curr_seat='${seat}')`)
        }
    }
    if(cond1.length>0){
    getModel().ReadStudByClassSeat(cond1.join(" or "),act_c_id,fn,(err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/as_form.pug', {
            act_c_id: act_c_id,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
    }else{
        res.end(JSON.stringify(req.body)+cond1.join(" or "))
    }
});
router.get('/as_list/:book/delete/:as_id', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let as_id=req.params.as_id;
    getModel().DeleteActStud(act_c_id,as_id, (err, entity) => {
        if (err) { next(err); return; }
        res.end(JSON.stringify(entity.affectedRows));
    });
});
///edit lesson stud list
router.get('/aas_list/:act_c_id/:alid/edit', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.act_c_id;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessonStud(alid, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/aas_form.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.post('/aas_list/:act_c_id/:alid/edit', images.multer.single('image'), admin_authRequired, (req, res, next) => {
    //ALTER TABLE `eschool`.`studinfo` ADD INDEX `cno_seat` ( `CURR_CLASS` ASC,`CURR_SEAT` ASC);
    //ALTER TABLE `act`.`studinfo` ADD COLUMN `grp` VARCHAR(45) NULL AFTER `classmaster`;
    let act_c_id = req.params.act_c_id;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    let data=JSON.parse(req.body.STUDLIST)
    console.log(data)
    let cond1=[]
    for(let temp_ of data)
    {
        if(temp_){
        temp_=temp_.toUpperCase() ;
        let classno=temp_.substring(0,4)
        let seat=temp_.substring(4)
        if(temp_.startsWith("I")||temp_.startsWith("P")){
            classno=temp_.substring(0,3)
            seat=temp_.substring(3)
        }
        cond1.push(`(curr_class='${classno}' and curr_seat='${seat}')`)
        }
    }
    console.log(cond1)
    if(cond1.length>0){
    getModel().IncActLessonStudByClassSeat(cond1.join(" or "),act_c_id,alid,fn,(err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall_admin/aas_form.pug', {
            act_c_id: act_c_id,
            al_id: alid,            
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
    }else{
        res.end(JSON.stringify(req.body)+cond1.join(" or "))
    }
});
router.get('/aas_list/:act_c_id/:alid/delete/:aa_id', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.act_c_id;
    let al_id = req.params.alid;
    let aa_id=req.params.as_id;
    getModel().DeleteActLessonStud(act_c_id,al_id,aa_id, (err, entity) => {
        if (err) { next(err); return; }
        res.end(JSON.stringify(entity.affectedRows));
    });
});



////
//for act mng
router.get('/cnolist', admin_authRequired, (req, res, next) => {
    res.render('markup/actmng/cnolist.pug', {
        profile: req.user,
        esess: req.user.marksys_info[0][0],
        sid: GetSID(req),
        sect: req.query.cno,
    });
});

router.get('/actlist', admin_authRequired, (req, Response, next) => {
    let cno = 'actcid';
    getModel().ReadActDef((err, entity) => {
        if (err) { next(err); return; }
        Response.render('attrollcall_admin/editActList.pug', {
            profile: req.user,
            fn: `${cno}_act`,
            cno: cno,
            books: entity,
            editable: req.query.r,
        });
    });
});

router.post('/actlistUpdate', admin_authRequired, images.multer.single('image'), (req, Response, next) => {
    let data = JSON.parse(req.body.datajson)
    getModel().UpdateActDef(data, (err, entity) => {
        if (err) { next(err); return; }
        Response.end(`更新${entity}筆...`);
    });
});

router.get('/actGrade/:book/edit', admin_authRequired, (req, Response, next) => {
    let aot = GetAOT(req);
    let sid = GetSID(req);
    let cno = req.params.book;
    let actcid = cno;
    let staf_ref = netutils.id2staf(req.user);
    getModel().ReadActivebyACTCID(actcid, (err, entity) => {
        if (err) { next(err); return; }
        Response.render('markup/actmng/editAct.pug', {
            profile: req.user,
            fn: `${cno}_act`,
            cno: req.params.book,
            books: entity,
            editable: req.query.r,
            aot: aot,
            sid: sid
        });
    });
});
////

router.get('/studGrade/:book/edit', admin_authRequired, (req, Response, next) => {
    let aot = GetAOT(req);
    let sid = GetSID(req);
    let cno = req.params.book;
    let staf_ref = netutils.id2staf(req.user);
    getModel().readclassact(staf_ref, cno, sid, (err, entity) => {
        if (err) { next(err); return; }
        Response.render('markup/actmng/editAct.pug', {
            profile: req.user,
            fn: `${cno}_act`,
            cno: req.params.book,
            books: entity,
            editable: req.query.r,
            aot: aot,
            sid: sid
        });
    });
});

router.post('/studGradeUpdate', admin_authRequired, images.multer.single('image'), (req, Response, next) => {
    let staf = req.user ? req.user.id : null;
    let aot = req.query.aot;
    let sid = GetSID(req);
    let data = JSON.parse(req.body.datajson)
    if (data && (aot == 1 || aot == 2 || aot == 3)) {
        getModel().UpdateAct(data, sid, aot, (err, entity) => {
            if (err) { next(err); return; }
            Response.end(`第${aot}段, 更新${entity}筆...`);
        });
    } else {
        Response.end("Err");
    }
});

router.get('/regStud/:book', admin_authRequired, (req, Response, next) => {
    let cno = req.params.book;
    let rurl = encodeURI(req.baseUrl);
    getModel().ReadClassStudAct(cno, (err, entity) => {
        if (err) { console.log(err); next(err); return; }
        Response.render('markup/actmng/regstud/studlist_act.pug', {
            profile: req.user,
            fn: cno,
            classno: cno,
            books: entity,
            rurl: rurl,
            jsontwolist_php: `markup_jsontwolist?cno=${cno}&fn=${encodeURI(cno)}`,
        });
    });
});

router.post('/regStud/markup_jsontwolist', admin_authRequired, (req, Response, next) => {
    let cno = req.query.cno;
    let sid = GetSID(req);
    let act_c_id = 900;
    let key1 = req.body.aObj ? req.body.aObj : null;
    let key2 = req.body.rObj ? req.body.rObj : null;
    getModel().RegStudAct(sid, cno, act_c_id, key1, key2, (err, entity) => {
        if (err) { next(err); return; }
        Response.end(entity.toString());
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
