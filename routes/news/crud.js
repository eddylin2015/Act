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
    return require(`./model-mysql-pool_news`);
}

function authRequired(req, res, next) {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    if (req.user) {
        //req.session.al_pass = act_c_id
    }
    if (!req.session.al_pass) {
        return res.redirect(`/internal/activitycourses/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    if (req.session.al_pass != act_c_id) {
        return res.redirect(`/internal/activitycourses/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
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
    if (email === "cool@mo") {req.session.items_category="其他"; return  true};
    if (email === "lammou@mail.mbc.edu.mo") {req.session.items_category="其他"; return  true};
    if (email === "joe853.hong@mail.mbc.edu.mo") {req.session.items_category="其他"; return  true};
    if (email === "fongsioman@mail.mbc.edu.mo") {req.session.items_category="信息"; return  true};
    return false;
  }
function admin_authRequired(req, res, next) {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    if (req.user&&checkuser(req) ) {
        req.session.al_adm_pass = act_c_id
        return next();
    }
    if (!req.session.al_adm_pass) {
        return res.redirect(`/internal/activitycourses_admin/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    if (req.session.al_adm_pass != act_c_id) {
        return res.redirect(`/internal/activitycourses_admin/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
    }
    next();
}
const router = express.Router();

function fmt_time() {
    let d = new Date(), Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
    let HH = d.getHours(), MM = d.getMinutes(), SS = d.getSeconds(), MS = d.getMilliseconds();
    return Y + '' + (M < 10 ? "0" + M : M) + '' + (D < 10 ? "0" + D : D) + "T" + (HH < 10 ? '0' + HH : HH) + ":" + (MM < 10 ? "0" + MM : MM) + ":" +(SS < 10 ? "0" + SS : SS) // SS +":" + MS;
}

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

//
//xml/news.xml
//RSS-Feeds
//RSS-Feeds/NewsRelease

router.get('/', (req, res, next) => {
    getModel().ReadpubItems((err, entity) => {
        if (err) { next(err); return; }
        res.render('news/index.pug', {
            profile: req.user,
            books: entity,
        });
    });
});
router.get('/list', admin_authRequired, (req, Response, next) => {
    if(!req.session.items_category) return Response.end("end.")
    let cno = 'news';
    let category=req.session.items_category
    getModel().ReadItemsByCategory(category,(err, entity) => {
        if (err) { next(err); return; }
        Response.render('news/list.pug', {
            profile: req.user,
            fn: `${cno}_items`,
            cno: cno,
            books: entity,
            editable: req.query.r,
        });
    });
});

/**
   * GET /books/:id
   *
   * Display a book.
   */
 router.get('/item/:book', (req, res, next) => {
    if(!req.session.items_category) return Response.end("end.")
    let cno = 'news';
    let category=req.session.items_category

    getModel().read(req.params.book,category, (err, entity) => {
      if (err) {
        next(err);
        return;
      }
      res.render('news/view.pug', {
        profile: req.user,
        fn: `${cno}_items`,
        cno: cno,
        book: entity,
      });
    });
  });
  
/**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
 router.get('/item/:book/edit', (req, res, next) => {
    if(!req.session.items_category) return Response.end("end.")
    let cno = 'news';
    let category=req.session.items_category     
    getModel().read(req.params.book,category, (err, entity) => {
      if (err) {
        next(err);
        return;
      }
      res.render('news/form.pug', {
        book: entity,
        action: 'Edit',
      });
    });
  });
  /**
   * POST /books/:id/edit
   *
   * Update a book.
   */
  router.post(
    '/item/:book/edit',
    images.multer.single('image'),
    (req, res, next) => {
        if(!req.session.items_category) return Response.end("end.")
        let cno = 'news';
        let category=req.session.items_category        
      const data = req.body;
      getModel().update(req.params.book,category, data, (err, savedData) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect(`${req.baseUrl}/item/${savedData.iid}`);
      });
    }
  );
////
router.get('/items', admin_authRequired, (req, Response, next) => {
    if(!req.session.items_category) return Response.end("end.")
    let cno = 'news';
    let category=req.session.items_category
    getModel().ReadItemsByCategory(category,(err, entity) => {
        if (err) { next(err); return; }
        Response.render('news/editItems.pug', {
            profile: req.user,
            fn: `${cno}_items`,
            cno: cno,
            books: entity,
            editable: req.query.r,
        });
    });
});

router.post('/itemsUpdate', admin_authRequired, images.multer.single('image'), (req, Response, next) => {
    let data = JSON.parse(req.body.datajson)
    let category=req.session.items_category
    getModel().UpdateItemsByCategory(data, category, (err, entity) => {
        if (err) { next(err); return; }
        Response.end(`更新${entity}筆...`);
    });
});
router.get('/mng_items', admin_authRequired, (req, Response, next) => {
    if(!req.session.items_category) return Response.end("end.")
    let cno = 'news';
    let category=req.session.items_category
    getModel().ReadItemsByMng((err, entity) => {
        if (err) { next(err); return; }
        Response.render('news/editItems.pug', {
            profile: req.user,
            fn: `${cno}_items`,
            cno: cno,
            books: entity,
            editable: req.query.r,
        });
    });
});

router.post('/mng_itemsUpdate', admin_authRequired, images.multer.single('image'), (req, Response, next) => {
    let data = JSON.parse(req.body.datajson)
    let category=req.session.items_category
    getModel().UpdateItemsByMng(data,  (err, entity) => {
        if (err) { next(err); return; }
        Response.end(`更新${entity}筆...`);
    });
});

router.get('/xml/news.xml', (req, res, next) => {
    getModel().ReadItems((err, entity) => {
        if (err) { next(err); return; }
        res.render('news/xml/xml_format.pug', {
            profile: req.user,
            books: entity,
            al_pass: req.session.al_adm_pass
        });
    });
});
router.get('/RSS-Feeds', (req, res, next) => {
    getModel().ReadItems((err, entity) => {
        if (err) { next(err); return; }
        res.render('news/xml/xml_format.pug', {
            profile: req.user,
            books: entity,
            al_pass: req.session.al_adm_pass
        });
    });
});
router.get('/RSS-Feeds/NewsRelease', (req, res, next) => {
    getModel().ReadItems((err, entity) => {
        if (err) { next(err); return; }
        res.render('news/xml/xml_format.pug', {
            profile: req.user,
            books: entity,
            al_pass: req.session.al_adm_pass
        });
    });
});


//for autor
router.get('/al_list/:book', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    getModel().ReadActLessons(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        res.render('activitycourses_admin/al_list.pug', {
            act_c_id: act_c_id,
            profile: req.user,
            books: entity,
            fn: fn,
        });
    });
});
router.get('/al_list/:book/add', admin_authRequired, (req, res, next) => {
    let act_c_id = req.params.book;
    let fn = req.query.fn ? req.query.fn : "";
    let al_datetime = fmt_time()
    res.render('activitycourses_admin/al_form.pug', {
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
        res.render('activitycourses_admin/aa_view.pug', {
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
        res.render('activitycourses_admin/aa_form.pug', {
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
        res.render('activitycourses_admin/aa_view.pug', {
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
        res.render('activitycourses_admin/as_form.pug', {
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
        res.render('activitycourses_admin/as_form.pug', {
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
router.get('/al_login/:book', (req, res, next) => {
    let act_c_id = req.params.book;
    let act = req.query.fn;
    res.render('activitycourses_admin/al_login.pug', {
        profile: req.user,
        act_c_id: act_c_id,
        act: act
    });
});
router.post('/al_login/:book', images.multer.single('image'), (req, res, next) => {
    let act_c_id = req.body.ActID;
    let fn = req.body.Act;
    getModel().ReadActDefbyId(act_c_id, (err, entity) => {
        if (err) { next(err); return; }
        if (req.body.password == entity[0].pwd_adm) {
            req.session.al_adm_pass = act_c_id
            return res.redirect(`/internal/activitycourses_admin/al_list/${act_c_id}?fn=${encodeURI(fn)}`);
        }else{
            return res.redirect(`/internal/activitycourses_admin/al_login/${act_c_id}?fn=${encodeURI(fn)}`);
        }
    });
});

router.get('/al_logout', (req, res, next) => {
    req.session.al_adm_pass = null;
    return res.redirect(`/internal/activitycourses_admin`);
});

//for act mng
router.get('/cnolist', admin_authRequired, (req, res, next) => {
    res.render('markup/actmng/cnolist.pug', {
        profile: req.user,
        esess: req.user.marksys_info[0][0],
        sid: GetSID(req),
        sect: req.query.cno,
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
