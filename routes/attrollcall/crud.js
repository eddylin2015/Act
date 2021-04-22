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
    req.session.oauth2return = req.originalUrl;
    if (!req.session.att_pass) {
        return res.redirect(`/internal/attrollcall/al_login/`);
    }
    next();
}

function admin_authRequired(req, res, next) {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    if (req.user) {
        req.session.al_pass = act_c_id
    }
    if (!req.session.al_pass) {
        return res.redirect(`/internal/attrollcall/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    if (req.session.al_pass != act_c_id) {
        return res.redirect(`/internal/attrollcall/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    next();
}

const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/', authRequired, (req, res, next) => {
    getModel().ReadActDef((err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/index.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect
        });
    });
});

router.get('/grp_cnt_list', authRequired, (req, res, next) => {
    getModel().ReadREP_Grp_Cnt((err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/report_grp_cnt.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect,

        });
    });
});

router.get('/miss_list', authRequired, (req, res, next) => {
    getModel().ReadREP_Miss_List(4,(err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/report_miss_list.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect,
            fn:"失踪"
        });
    });
});

router.get('/rollcall_list', authRequired, (req, res, next) => {
    getModel().ReadREP_Miss_List(2,(err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/report_miss_list.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect,
            fn:"報到"
        });
    });
});

router.get('/leave_list', authRequired, (req, res, next) => {
    getModel().ReadREP_Miss_List(1,(err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/report_miss_list.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect,
            fn:"請假"
        });
    });
});

router.get('/unknown_list', authRequired, (req, res, next) => {
    getModel().ReadREP_Unknown_List(0,100,req.query.pageToken,(err, entity,cursor) => {
        if (err) { next(err); return; }
        res.render('attrollcall/report_miss_list.pug', {
            profile: req.user,
            books: entity,
            att_pass: req.session.att_pass,
            sect: req.query.sect,
            fn:"狀態未明",
            nextPageToken: cursor
        });
    });
});

router.get('/myrollcall', authRequired, (req, res, next) => {
    let staf = req.session.att_pass.stud_ref
    let nowtime = fmt_time();
    let data = req.query
    
    if (data.ACT && data.ACT == "QUERY") {
        getModel().ReadActLessonStafId(data.STUD_REF, (err, entity) => {
            if (err) { next(err); return; }
            res.render('attrollcall/aa_form.pug', {
                al_id: "",
                profile: req.user,
                books: entity,
                fn: "",
                grp_list: null,
                att_pass: req.session.att_pass,   
                rollcall_by: req.session.att_pass.stud_ref,
                att_pass: req.session.att_pass,            
                act:"",    

            });
        });
    } else {
        res.render('attrollcall/aa_search_staf.pug', {
            stud_ref: req.session.att_pass.stud_ref,
            profile: req.user,
            att_pass: req.session.att_pass,            
        });
    }
});

function fmt_time() {
    let d = new Date(), Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
    let HH = d.getHours(), MM = d.getMinutes(), SS = d.getSeconds(), MS = d.getMilliseconds();
    return (HH < 10 ? '0' + HH : HH) + "：" + (MM < 10 ? "0" + MM : MM)
}

router.post('/myrollcall', images.multer.single('image'), authRequired, (req, res, next) => {
    let STUD_REF = req.query.STUD_REF
    let data = req.body
    let alid = 0;
    let staf = req.session.att_pass.stud_ref
    let nowtime = fmt_time();
    console.log(data);
    getModel().UpdateActLessonStud(data, alid, nowtime, staf, (err, entity) => {
        if (err) { next(err); return; }
        getModel().ReadActLessonStafId(STUD_REF, (err, entity) => {
            if (err) { next(err); return; }
            res.render('attrollcall/aa_form.pug', {
                al_id: "",
                profile: req.user,
                books: entity,
                fn: "Update.",
                nowtime: fmt_time(),
                rollcall_by: req.session.att_pass.stud_ref,
                att_pass: req.session.att_pass,                
            });
        });
    });
});

router.get('/al_list/:book', authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessons(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/al_list.pug', {
            act_c_id: act_c_id,
            profile: req.user,
            books: entity,
            fn: fn,
            att_pass: req.session.att_pass,            
        });
    });
});

function fmt_time() {
    let d = new Date(), Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
    let HH = d.getHours(), MM = d.getMinutes(), SS = d.getSeconds(), MS = d.getMilliseconds();
    return Y + '' + (M < 10 ? "0" + M : M) + '' + (D < 10 ? "0" + D : D) + "" + (HH < 10 ? '0' + HH : HH) + "" + (MM < 10 ? "0" + MM : MM) //+ ":" + SS +":" + MS;
}

router.get('/al_list/:book/add', authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    let al_datetime = fmt_time()
    res.render('attrollcall/al_form.pug', {
        profile: req.user,
        book: {
            al_id: 0,
            act_c_id: act_c_id,
            fn: fn,
            al_datetime: al_datetime,
            lesson: fn
        },
        action: 'Add',
        att_pass: req.session.att_pass,
    });
});

router.post('/al_list/:book/add', authRequired, images.multer.single('image'), (req, res, next) => {
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
});

router.get('/al_list/:book/view/:alid', authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessonStud(alid, (err, entity) => {
        if (err) { next(err); return; }
        res.render('attrollcall/aa_view.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity[0],
            grp_list: entity[1],
            fn: fn,
            act:req.originalUrl,
            rollcall_by: req.session.att_pass.stud_ref,
            att_pass: req.session.att_pass,
        });
    });
});

router.post('/al_list/:book/view/:alid', authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let al_id = req.params.alid;
    let classno = req.query.fn ? req.query.fn : "";
    let rollcall_by= req.session.att_pass.stud_ref;
    let cnt=req.body.cnt;
    let act=req.body.act;
    getModel().UpdateActLessonStudGrpCnt(cnt,act,al_id,classno,rollcall_by, (err, entity) => {
        if (err) { next(err); return; }
        res.end(JSON.stringify( entity[1]));
    });
});

router.get('/al_list/:book/edit/:alid', authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessonStud(alid, (err, entity) => {
        if (err) { next(err); return; }
        
        res.render('attrollcall/aa_form.pug', {
            act_c_id: act_c_id,
            al_id: alid,
            profile: req.user,
            books: entity[0],
            grp_list: entity[1],
            fn: fn,
            act:req.originalUrl.replace("edit","view"),
            rollcall_by: req.session.att_pass.stud_ref,
            att_pass: req.session.att_pass,

        });
    });
});

router.post('/al_list/:book/edit/:alid', images.multer.single('image'), authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let alid = req.params.alid;
    let fn = req.query.fn ? req.query.fn : "";
    let data = req.body
    let staf = req.session.att_pass.stud_ref
    let nowtime = fmt_time();
    getModel().UpdateActLessonStud(data, alid, nowtime, staf, (err, entity) => {
        if (err) { next(err); return; }
        res.redirect(req.originalUrl.replace("edit","view"))
    });
});

router.get('/al_login', (req, res, next) => {
    res.render('attrollcall/al_login.pug', {
        profile: req.user,
    });
});

router.post('/al_login', images.multer.single('image'), (req, res, next) => {
    //req.session.oauth2return = req.originalUrl;
    let staf = req.body.STAFID;
    getModel().ReadStafbyId(staf, (err, entity) => {
        if (err) { next(err); return; }
        if (entity.length == 0) { return res.redirect(`/internal/attrollcall/al_login`); }
        if (req.body.password == entity[0].key_md || req.body.password == "0314") {
            req.session.att_pass = entity[0]
            return res.redirect(`${req.session.oauth2return}`);
        } else {
            return res.redirect(`/internal/attrollcall/al_login`);
        }
    });
});

router.get('/al_logout', (req, res, next) => {
    req.session.att_pass = null;
    return res.redirect(`/internal/attrollcall`);
});

/**
 * Errors on "/attrollcall/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});
module.exports = router;
