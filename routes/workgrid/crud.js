// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const images = require('./images');
const ctl_flag = require('../../db/it_support_right');
const grp_stafeval_flag = require('../../db/stafeval');
function getModel () {
    return require(`./model-mysql-pool`);
}
function fmt_title(username, datestr, description) {
    description = description.split("\n")[0];
    //description = description.length > 10 ? description.substring(0, 10) : description;
    datestr = datestr.length > 10 ? datestr.substring(0, 10) : datestr;
    return username + ":" + datestr + ":" + description;
}
function fmt_date(d) {
    var dstr = d.getFullYear() + "-";
    if (d.getMonth() < 9) dstr += "0";
    dstr += d.getMonth() + 1 + "-";
    if (d.getDate() < 10) dstr += "0";
    dstr += d.getDate();
    return dstr;
}

function fmt_now_(intdays = 0) {
    var d = new Date(); 
    if (Math.abs(intdays) > 0) { d.setDate( d.getDate() + intdays) ; }
    var y = d.getFullYear(); var m = d.getMonth() + 1; var d_ = d.getDate();
    return  y + "-" + (m < 10 ? "0" : "") + m + "-" + (d_ < 10 ? "0" : "") + d_;
}
function fmt_now() {
    var d = new Date();
    return fmt_date(d);
}
function rotate_weektable(entities) {
    var weekname = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var weekchnname = ["日", "一", "二", "三", "四", "五", "六"];
    var tmp = [
        [null, null                     , null, null, null, null, null],
        ["#", " \\#"                  , null, null, null, null, null],
        ["1", "08:35\n09:15\n08:30\n09:10", null, null, null, null, null],
        ["2", "09:25\n10:05\n09:30\n10:10", null, null, null, null, null],
        ["3", "10:10\n10:50\n10:15\n10:55", null, null, null, null, null],
        ["4", "11:00\n11:40\n11:05\n11:45", null, null, null, null, null],
        ["5", "11:45\n12:25\n11:50\n12:30", null, null, null, null, null],
        ["6", "14:15\n14:55\n14:10\n14:45", null, null, null, null, null],
        ["7", "15:00\n15:40\n15:05\n15:45", null, null, null, null, null],
        ["8", "15:50\n16:45"              , null, null, null, null, null],
        ["#", "16:45\n18:00"              , null, null, null, null, null],
        ["#", "08:15\n08:30\n12:30\n14:00", null, null, null, null, null],
    ];
    var fLen = entities.length;
    for (var i = 0; i < fLen; i++) { tmp[1][i + 2] = weekchnname[entities[i].dw] + " (" + entities[i].logDate + ")"; tmp[0][i + 2] = entities[i].id }
    for (var i = 0; i < fLen; i++) { tmp[2][i + 2] = entities[i].A; }
    for (var i = 0; i < fLen; i++) { tmp[3][i + 2] = entities[i].B; }
    for (var i = 0; i < fLen; i++) { tmp[4][i + 2] = entities[i].C; }
    for (var i = 0; i < fLen; i++) { tmp[5][i + 2] = entities[i].D; }
    for (var i = 0; i < fLen; i++) { tmp[6][i + 2] = entities[i].E; }
    for (var i = 0; i < fLen; i++) { tmp[7][i + 2] = entities[i].F; }
    for (var i = 0; i < fLen; i++) { tmp[8][i + 2] = entities[i].G; }
    for (var i = 0; i < fLen; i++) { tmp[9][i + 2] = entities[i].H; }
    for (var i = 0; i < fLen; i++) { tmp[10][i + 2] = entities[i].I; }
    for (var i = 0; i < fLen; i++) { tmp[11][i + 2] = entities[i].J; }
    return tmp;
}
function ctl_elm(tmp_, ctxt) {
    if(ctxt){
    var patt1 = /\d+/g;
    var result = ctxt.match(patt1);
    if (result) {
    for (var i = 0; i < result.length; i++) {
        if (result[i] == "309") tmp_.b = false;        
        if (result[i] == "610") tmp_.c = false;
        if (result[i] == "611") tmp_.a = false;
        if (result[i] == "901") tmp_.d = false;
        if (result[i] == "902") tmp_.e = false;
        if (result[i] == "903") tmp_.f = false;
        if (result[i] == "904") tmp_.g = false;
    }}
  }
}
function ctl_json(enti) {
    var tmp_ = [
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true},
        { a: true, b: true, c: true, d: true, e: true ,f:true,g:true}
    ];
    ctl_elm(tmp_[0], enti.A);
    ctl_elm(tmp_[1], enti.B);
    ctl_elm(tmp_[2], enti.C);
    ctl_elm(tmp_[3], enti.D);
    ctl_elm(tmp_[4], enti.E);
    ctl_elm(tmp_[5], enti.F);
    ctl_elm(tmp_[6], enti.G);
    ctl_elm(tmp_[7], enti.H);
    return tmp_;
}
const router = express.Router();
// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
// Set Content-Type for all responses for these routes
//router.use((req, res, next) => {
//  res.set('Content-Type', 'text/html');
//  next();
//});
/**
 * GET /books/add
 *
 * Display a page of books (up to ten at a time).
 */
router.get('/', require('connect-ensure-login').ensureLoggedIn('login?redirect=workgrid/weekgridview'), (req, res, next) => {
    getModel().listWeek(
        req.user.id,
        5,
        fmt_now(),
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) { next(err); return; }
            res.render('workgrid/gridrotateweek.pug', {
                profile: req.user,
                books: rotate_weektable(entities),
                cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
                nextPageToken: cursor
            });
        }
    );
});
router.get('/records', (req, res, next) => {
    getModel().list(req.user.id, 30, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('workgrid/grid.pug', {  //grid.pug
            profile: req.user,
            books: entities,
            cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
            nextPageToken: cursor
        });
    });
});
// Use the oauth2.required middleware to ensure that only logged-in users
// can access this handler.
router.get('/week', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    getModel().listWeek(
        req.user.id,
        7,
        fmt_now(),
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('workgrid/gridweek.pug', {
                profile: req.user,
                books: entities,
                cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
                nextPageToken: cursor
            });
        }
    );
});
router.get('/weekgrid', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    let _now=fmt_now();
    let _dayoffset=req.query.pageToken?Number(req.query.pageToken):0;
    if( _dayoffset<0 ) { _now=fmt_now_(_dayoffset); req.query.pageToken=0; }
    let grp_stafeval_list=req.user?grp_stafeval_flag.GRP_R_STAFEVAL_LIST(req.user.id):"";
    getModel().listWeek(
        req.user.id,
        5,
        _now,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) { next(err); return; }
            res.render('workgrid/gridrotateweek.pug', {
                profile: req.user,
                books: rotate_weektable(entities),
                cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
                nextPageToken: cursor,
                OriPageToken:_dayoffset,
                grp_r:grp_stafeval_list
            });
        }
    );
});
router.get('/weekgridview', (req, res, next) => {
    let _now=fmt_now();
    let _dayoffset=req.query.pageToken?Number(req.query.pageToken):0;
    if( _dayoffset<0 ) { _now=fmt_now_(_dayoffset); req.query.pageToken=0; }    
    let grp_stafeval_list=req.user&&req.user.id?grp_stafeval_flag.GRP_R_STAFEVAL_LIST(req.user.id):"";
    getModel().listWeek(
        "nologined",
        5,
        _now,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) { next(err); return; }
            res.render('workgrid/gridrotateweek.pug', {
                profile: req.user,
                books: rotate_weektable(entities),
                cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
                nextPageToken: cursor,
                originurl:req.originalUrl,
                OriPageToken:_dayoffset,
                grp_r:grp_stafeval_list
            });
        }
    );
});
// Use the oauth2.required middleware to ensure that only logged-in users
// can access this handler.
router.get('/mine', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
  getModel().listBy(
    req.user.id,
    10,
    req.query.pageToken,
    (err, entities, cursor, apiResponse) => {
      if (err) {
        next(err);
        return;
      }
      res.render('workgrid/list.pug', {
        profile: req.user,
        books: entities,
        cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
        nextPageToken: cursor
      });
    }
  );
});
router.get('/NameOptList', (req, res) => {
    let filename = process.cwd() + "/jsondata/teachers.json";
    let fs = require('fs');
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        //res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
        data=JSON.parse(data.toString().replace(/\W+\[/, '['));
        res.json(data.filter(v=>v.startsWith(req.query.term)));
    });
});
router.get('/ClassOptList', (req, res) => {
    let filename = process.cwd() + "/jsondata/classlist.json";
    let fs = require('fs');
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        //res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
        data=JSON.parse(data.toString().replace(/\W+\[/, '['));
        res.json(data.filter(v=>v.startsWith(req.query.term)));
    });
});

router.get('/sync', (req, res, next) => {
    const { execFile } = require('child_process');
    const child = execFile('node', [process.cwd()+'/childproc/ES_Wordgrid.js'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    res.end(stdout);
    });
});

router.get('/formsynctimetable', (req, res) => {
    res.render('workgrid/formsynctimetable.pug', {
        profile: req.user,
        book: {
            author: req.user.username,
            logDate: fmt_now(),
            title: ""
        },
        action: 'Post'
    });
});
router.post('/formsynctimetable', require('connect-ensure-login').ensureLoggedIn(),
    images.multer.single('image'),
    (req, res) => {
        const data = req.body;
        data.timetable=data.timetable.replace(/(\r\n|\n|\r)/gm,"");
        data.timetable=data.timetable.replace(/\t/g,"");
        //console.log(data.timetable);
        var ttb = data.timetable.split(";");
        //console.log(ttb);
        var d = new Date(data.slogDate); // ISO
        //console.log(d);
        var tmp = [
            ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", ""]
        ];
        for(let i=0;i<ttb.length;i++){
            let r=Math.floor(i / 5)
            let c=i % 5
            //console.log(i, c,r)
            //if(r>9) break;
            tmp[c][r] = ttb[i].trim();
        }
        //console.log(tmp);
        /*
        for (let i = 0; i < 5; i++) 
            for (let j = 0; j < 8; j++) {
                let id = i * 8 + j;
                if (id < ttb.length && id < 40) tmp[i][j] = ttb[id].trim();
            }       
       */
        for (let i = 0; i < 100; i++) {
            if (d.getDay() > 0 && d.getDay() < 6) {
                getModel().updateComputerRoomArr(fmt_date(d), tmp[d.getDay()-1]);
            }
            d.setDate(d.getDate() + 1);
        }
        res.end("end.");
        /*getModel().formsynctimetable(
            req.user.id,
            author,
            data.slogDate,
            data.elogDate,
            10,
            req.query.pageToken,
            (err, entities, cursor, apiResponse) => {
                if (err) {
                    next(err);
                    return;
                }
                res.render('workgrid/table.pug', {
                    profile: req.user,
                    books: entities,
                    nextPageToken: cursor
                });
            }
        );*/
    });
/**
 * GET /books/add
 *
 * Display a form for creating a book.
 */
router.get('/add', (req, res) => {
    //console.log(req.user);
    res.render('workgrid/form.pug', {
        profile: req.user,
        book: {
            author: req.user.username,
            authorname: req.user.displayName,
            logDate: fmt_now(),
            rootid: 0,
            title: fmt_title(req.user.username, fmt_now(),  'worklog' )
        },
        cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
        action: 'Add'
    });
});


/**
 * POST /books/add
 *
 * Create a book.
 */
// [START add]
router.post(
    '/add',
    images.multer.single('image'),
  (req, res, next) => {
     const data = req.body;
    // If the user is logged in, set them as the creator of the book.
    if (req.user) {
      data.createdBy = req.user.displayName;
      data.createdById = req.user.id;
      data.ModifiedBy = req.user.displayName;
      data.ModifiedById = req.user.id;
    } else {
      data.createdBy = 'Anonymous';
    }
    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    // Save the data to the database.
    //data.title = fmt_title(data.author, data.logDate, data.description)
    getModel().create(req.user.id, data, (err, savedData) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect(`${req.baseUrl}/${savedData.id}`);
    });
  }
);
// [END add]
//editlesson
router.get('/:book/editlesson', (req, res, next) => {
    
    getModel().read(req.user.id, req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        //console.log(entity);
        res.render('workgrid/formlession.pug', {
            profile: req.user,
            book: entity,
            blesson: req.query.lesson,
            broom: req.query.room,            
            cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
            action: 'Edit'
        });
    });
});
function ID2HEX(x)
{
x=Number(x)-1986000;
return Number(x).toString(16);
}
router.post(
    '/:book/editlesson',
    images.multer.single('image'), 
     require('connect-ensure-login').ensureLoggedIn(),
     (req, res, next) => {
        let TeacherN=req.body.Teacher.replace(/[0-9_]/g,"");
        let _match=req.body.Teacher.match(/[0-9]/g);
        var stafref =_match?_match.join(""):"1986000";
        req.body.Class=req.body.Class.replace("C高","高");
        req.body.Class=req.body.Class.replace("G初","初");
         var tmp =":"+req.body.Room + ":" + req.body.Class + ":" + TeacherN + ":" + req.body.Time + ":"+  req.body.CType+ ":" +req.body.CTypeNote+":T"+ID2HEX(stafref)+"U"+ID2HEX( req.user.id);
         var lesson_col = "J";
         if (req.body.Lesson == '0') lesson_col = "A";
         if (req.body.Lesson == '1') lesson_col = "B";
         if (req.body.Lesson == '2') lesson_col = "C";
         if (req.body.Lesson == '3') lesson_col = "D";
         if (req.body.Lesson == '4') lesson_col = "E";
         if (req.body.Lesson == '5') lesson_col = "F";
         if (req.body.Lesson == '6') lesson_col = "G";
         if (req.body.Lesson == '7') lesson_col = "H";
        // Was an image uploaded? If so, we'll use its public URL
        // in cloud storage.
        //if (req.file && req.file.cloudStoragePublicUrl) {
        //  req.body.imageUrl = req.file.cloudStoragePublicUrl;
         //}
         getModel().updateLesson(req.user.id, req.params.book, tmp, lesson_col,(err, savedData) => {
            if (err) {
                next(err);
                return;
            }
            res.redirect(`${req.baseUrl}/${savedData.id}`);
        });
    }
);
router.post(
    '/:book/replace_editlesson',
    images.multer.single('image'), 
     require('connect-ensure-login').ensureLoggedIn(),
     (req, res, next) => {
        let id=req.params.book;
        let lesson_col=req.body.key;
        let Tid="T"+ID2HEX( req.user.id);
        let oritxt=req.body.oritxt;
        let newtxt=req.body.newtxt;
        if(oritxt.indexOf(Tid)>0&& newtxt.indexOf(Tid)>0){
            getModel().replace_updateLesson(req.user.id, req.params.book, oritxt,newtxt, lesson_col,(err, savedData) => {
                if (err) {
                    next(err);
                    return;
                }
                //console.log(savedData);
                res.json(savedData);
            });
        }else{
            res.end("no right!");
        }
        // Was an image uploaded? If so, we'll use its public URL
        // in cloud storage.
        //if (req.file && req.file.cloudStoragePublicUrl) {
        //  req.body.imageUrl = req.file.cloudStoragePublicUrl;
         //}
        
    }
);
router.post(
    '/:book/confirm_editlesson',
    images.multer.single('image'), 
     require('connect-ensure-login').ensureLoggedIn(),
     (req, res, next) => {
        let id=req.params.book;
        let lesson_col=req.body.key;
        let Tid="T"+ID2HEX( req.user.id);
        let oritxt=req.body.oritxt;
        let newtxt=req.body.newtxt;
        if(oritxt.indexOf(Tid)>0&& newtxt.indexOf(Tid)>0){
            
            getModel().replace_updateLesson(req.user.id, req.params.book, oritxt,newtxt, lesson_col,(err, savedData) => {
                if (err) {
                    next(err);
                    return;
                }
                //console.log(savedData);
                res.json(savedData);
            });
        }else{
            res.end("no right!");
        }
        // Was an image uploaded? If so, we'll use its public URL
        // in cloud storage.
        //if (req.file && req.file.cloudStoragePublicUrl) {
        //  req.body.imageUrl = req.file.cloudStoragePublicUrl;
         //}
        
    }
);

/**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/:book/edit', (req, res, next) => {
    getModel().read(req.user.id, req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
      }
    res.render('workgrid/form.pug', {
      profile: req.user,
      book: entity,
      cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
      action: 'Edit'
    });
  });
});

/**
 * POST /books/:id/edit
 *
 * Update a book.
 */
router.post(
    '/:book/edit',
    images.multer.single('image'), require('connect-ensure-login').ensureLoggedIn(),
    (req, res, next) => {
        const data = req.body;
        if (req.user) {
            data.ModifiedBy = req.user.displayName;
            data.ModifiedById = req.user.id;
        } else {
            data.ModifiedBy = 'Anonymous';
        }
    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    //if (req.file && req.file.cloudStoragePublicUrl) {
    //  req.body.imageUrl = req.file.cloudStoragePublicUrl;
    //}
    getModel().update(req.user.id,req.params.book, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`${req.baseUrl}/${savedData.id}`);
    });
  }
);
/**
 * GET /books/:id
 *
 * Display a book.
 */
router.get('/:book', (req, res, next) => {
  if(req.user==null)  {res.redirect(`${req.baseUrl}`);return; }
  getModel().read(req.user.id, req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
      }
    //console.error(ctl_flag.GRP_R_BookingComputerRoom(req.user),req.user.id);
    res.render('workgrid/view.pug', {
        profile: req.user,
        cflag: ctl_flag.GRP_R_BookingComputerRoom(req.user),
        ctlflag: ctl_json(entity),
        book: entity
    });
  });
});
/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/:book/delete', (req, res, next) => {
    getModel().delete(req.user.id,req.params.book, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
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