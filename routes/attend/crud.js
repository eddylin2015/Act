// attend 訪客登記
'use strict';

const express = require('express');
const images = require('./images');
function getModel () {
    return require(`./model-mysql-pool`);
}
function authRequired(req, res, next) {
    if (!req.user) {
        req.session.oauth2return = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

function fmt_now() {
    var d = new Date(),Y=d.getFullYear(),M=d.getMonth()+1,D=d.getDate();
    return Y+'-'+ (M<10? "0"+M : M)+'-'+(D<10? "0"+D : D);
}

function fmt_time() {
    let d = new Date(),Y=d.getFullYear(),M=d.getMonth()+1,D=d.getDate();
    let HH=d.getHours(),MM=d.getMinutes(),SS=d.getSeconds(),MS=d.getMilliseconds();
    return Y+'-'+ (M<10? "0"+M : M)+'-'+(D<10? "0"+D : D)+" "+HH + ":" +MM + ":" + SS +":" + MS;
}

const router = express.Router();

// Use the oauth middleware to automatically get the user's profile

router.get('/', authRequired, (req, res, next) => {
    getModel().listMore(50, req.user.id,
        req.query.pageToken,
        (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('attend/index.pug', {
            profile: req.user,
            books: entities,
            nextPageToken: cursor
        });
    });
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

router.get('/tags_stud_gs_data.tbl', authRequired, (req, res, next) => {
    let mimetype = "text/plain; charset=utf-8";
    let filename = process.cwd()+ "/jsondata/gsact.json";
    let fs = require('fs');
    //console.log(filename);
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
        try{
        data=JSON.parse(data.toString().replace(/\W+\[/, '['));
        
        res.write("<table>");
        for(let i=0;i<data.length;i++){
            res.write("<tr><td>"+data[i].id);
            res.write("<td>"+data[i].name);
            res.write("<td>"+data[i].classno);
            res.write("<td>"+data[i].seat);
            res.write("<td>"+data[i].code);
            res.write("<td>"+data[i].email);
        }
        res.write("</table>");
        return res.end();
       }catch(e){
         return res.end(e.message);
       }
    });
});
router.get('/tags_staf_gs_data.tbl', authRequired, (req, res, next) => {
    let mimetype = "text/plain; charset=utf-8";
    let filename = process.cwd()+ "/jsondata/gsactt.json";
    let fs = require('fs');
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
        try{
            data=JSON.parse(data.toString().replace(/\W+\[/, '['));
            res.write("<table>");
            for(let i=0;i<data.length;i++){
            res.write("<tr><td>"+data[i].id);
            res.write("<td>"+data[i].cname);
            res.write("<td>"+data[i].email);
            res.write("<td>"+data[i].code);
            }
            res.write("</table>");
            return res.end();
    }catch(e){
        return res.end(e.message);
      }
    });
});
router.get('/tags_stud_list_data.json', authRequired, (req, res, next) => {
    let mimetype = "text/plain";
    let filename = process.cwd()+ "/jsondata/studlist.json";
    staticlogfile(filename, mimetype, res); 
});
router.get('/tags_staf_list_data.json', authRequired, (req, res, next) => {
    let mimetype = "text/plain";
    let filename = process.cwd() + "/jsondata/stafflist_obj.json";
    let fs = require('fs');
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
        data=JSON.parse(data.toString().replace(/\W+\[/, '['));
        res.write("<table>");
        for(let i=0;i<data.length;i++){
            res.write("<tr><td>"+data[i].staf_ref);
            res.write("<td>"+data[i].cname);
            res.write("<td>"+data[i].ename);
        }
        res.write("</table>");
        return res.end();
    });
});

router.get('/mine', authRequired, (req, res, next) => {
    getModel().listBy(
        req.user.id,
        30,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('attend/index.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor
            });
        }
    );
});

router.get('/searchform', (req, res, next) => {
    res.render('attend/searchform.pug', {
        book: { title: '', author: '', logDate: fmt_now(), createdById:''}
    });
});

// authRequired,
router.post('/searchform',
    images.multer.single('image'),
    (req, res,next) => {
        var data = req.body;
        getModel().listTimestampBy(
            data.slogDate,
            data.elogDate,
            10,
            req.query.pageToken,
            (err, entities, cursor, apiResponse) => {
                if (err) {
                    next(err);
                    return;
                }
                res.render('attend/index.pug', {
                    profile: req.user,
                    books: entities,
                    nextPageToken: cursor
                });
            }
        );
    });

/**
 * GET /attend/add
 *
 * Display a form for creating a book.
 */
function GetKey() {
    var ASCIIcodepage = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': 'A', '11': 'B',
        '12': 'C', '13': 'D', '14': 'E', '15': 'F', '16': 'G', '17': 'H', '18': 'J', '19': 'K', '20': 'L', '21': 'M', '22': 'N', '23': 'P', '24': 'Q',
        '25': 'R', '26': 'S', '27': 'T', '28': 'U', '29': 'W', '30': 'X', '31': 'Y'
    }
    var d = new Date();
    var y = ASCIIcodepage[d.getFullYear() % 100 - 12];
    var m = ASCIIcodepage[d.getMonth()];
    var dd = ASCIIcodepage[d.getDate()];
    var hh = ASCIIcodepage[d.getHours()];
    var hrs = d.getMinutes() * 60 + d.getSeconds();
    var mls = hrs * 1000 + d.getMilliseconds();
    var mls = Math.abs(mls).toString(16);
    var a0 = ASCIIcodepage[Math.floor(hrs / 900)];
    var a1 = ASCIIcodepage[Math.floor(hrs % 900 / 30)];
    var a2 = ASCIIcodepage[hrs % 30];
    return "" + y + m + dd + hh + mls;//+ a0 + a1 + a2;
}

router.get('/add', (req, res) => {
    var key = req.user.id + GetKey() ;
    res.render('attend/form.pug', {
        profile: req.user,
        book: {
            loginuser: req.user.username,//  authorname: req.user.displayName,
            createdById: req.user.id,
            I: fmt_now(),
            keyid: key
        },
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
            data.loginuser = req.user.displayName;
            data.createdById = req.user.id;
        } else {
            data.createdBy = 'Anonymous';
        }
        let temp = data.I.replace(/-/gi, "");
        if (temp.length > 2) temp = temp.substring(2);
        let temp0 = data.O.replace(/:/gi, "")+"00";
        temp0 = temp0.substring(0, 2); 
        data.desc = temp + "h" + temp0 + "_00_" + data.A + "_" + data.note;
        data.checkdate = data.I;
        data.qm = "10102";
        data.datet = new Date();
        getModel().create(req.user.id, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }          
            res.redirect(`${req.baseUrl}/${savedData.keyid}`);
        });
    }
);

router.get('/:book', (req, res, next) => {
    //console.log("read");
    getModel().read(req.user.id,req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.render('attend/view.pug', {
            profile: req.user,
            book: entity
        });
    });
});

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
        //console.log(entity);
        res.render('attend/form.pug', {
            profile: req.user,
            book: entity,
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
    images.multer.single('image'), authRequired,
    (req, res, next) => {
        const data = req.body;
        let temp = data.I.replace(/-/gi, "");
        if (temp.length > 2) temp = temp.substring(2);
        let temp0 = data.O.replace(/:/gi, "") + "00";
        temp0 = temp0.substring(0, 2);
        data.desc = temp + "h" + temp0 + "_00_" + data.A + "_" + data.note;
        data.checkdate = data.I;
        getModel().update(req.user.id, req.params.book, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }
            res.redirect(`${req.baseUrl}/${savedData.keyid}`);
        });
    }
);

/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/:book/delete', (req, res, next) => {
    getModel().delete(req.user.id, req.params.book, (err) => {
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