// attend
'use strict';

const express = require('express');
const images = require('./images');
const fs = require('fs');
const https = require('https');
const http = require('http');
const querystring = require('querystring');
const { spawn } = require('child_process');


function html2txt(html) {
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
function NewsNodeGet(host_, path_, link_paths, date_) {
    http.get(
        {
            hostname: host_,
            port: 80,
            path: path_,
            method: 'GET',
            headers: { 'Cookie': "this.session_id" }
        },
        (res) => {
            res.on('data', (d) => {
                var html = d.toString();
                var pageLinka = html.match(/<a id=pageLink href=([\w|\W|\s|\S]*?)<\/a>/g);
                if (pageLinka) {
                    for (var i = 0; i < pageLinka.length; i++) {
                        if (pageLinka[i].indexOf('¼s§i') > 0 || pageLinka[i].indexOf('ª¯') > 0 || pageLinka[i].indexOf('°¨') > 0 || pageLinka[i].indexOf('®È') > 0) { }
                        else {
                            console.log(pageLinka[i]);
                            var url = pageLinka[i].replace("<a id=pageLink href=", '');
                            url = url.replace(/>([\w|\W|\s|\S]*?)<\/a>/gi, '');
                            link_paths.push(date_ + url);
                        }
                   }
                }
            });
        }).on('error', (e) => {
            console.log(e);
        });
}

function NewsNodeContentGet(host_, path_, filename) {
    http.get(
        {
            hostname: host_,
            port: 80,
            path: path_,
            method: 'GET',
            headers: { 'Cookie': "this.session_id" }
        },
        (res) => {
            res.on('data', (d) => {
                var html = d.toString();
                var pageLinka = html.match(/<a href=content_([\w|\W|\s|\S]*?)<\/a>/g);
                if (pageLinka) {
                    for (var i = 0; i < pageLinka.length; i++) {
                        var link_ = pageLinka[i].replace("content_", "http://www.macaodaily.com" + modaily_date()+"content_");// html2txt(pageLinka[i])
                       fs.appendFile(filename, link_+"\n", (err) => { if (err) throw err; });
                    }
                }
            });
       }).on('error', (e) => {
            console.log(e);
        });
}
function NewsGet(host_, path_, filename) {
    http.get(
        {
            hostname: host_,
            port: 80,
            path: path_,
            method: 'GET',
            headers: { 'Cookie': "this.session_id" }
       },
        (res) => {
            res.on('data', (d) => {
                var html = d.toString();
                fs.appendFile(filename, html2txt(html), (err) => { if (err) throw err; });
            });
        }).on('error', (e) => {
            console.log(e);
        });
}

let app = function () { }
app.vIntervalTimer = null;
app.index_ = 0;
app.link_paths = [];
app.filename = "htmlnews.txt";
app.GetWGLog = function () {
    if (app.index_ >= app.link_paths.length) {
        clearInterval(app.vIntervalTimer);
        return;
    }
    var path_ = app.link_paths[app.index_];
    app.index_++;
    console.log(app.index_, path_);
    fs.appendFile(app.filename, "\nhttp://www.macaodaily.com" + path_ + "\n", (err) => { if (err) throw err; });
    NewsNodeContentGet("www.macaodaily.com", path_, app.filename);
}
app.run = function () {
    app.vIntervalTimer = setInterval(app.GetWGLog, 2000);
}
function getModel () {
    return require(`./model-mysql-pool`);
}
function modaily_date() {
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var da = d.getDate()
    return "/html/" + y + "-" + (m < 10 ? "0" : "") + m + "/" + (da < 10 ? "0" : "") + da + "/";
}
function news_filename()
{
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var da = d.getDate()
    var date_ = "/html/" + y + "-" + (m < 10? "0":"") +m + "/" + (da < 10?"0":"")+  da + "/";
   return date_.replace(/\//g, "").replace(/-/g, "") + ".txt";
}
function fmt_title(username, datestr, description) {
    description = description.split("\n")[0];
    //description = description.length > 10 ? description.substring(0, 10) : description;
    datestr = datestr.length > 10 ? datestr.substring(0, 10) : datestr;
    return username + ":" + datestr + ":" + description;
}

function fmt_now() {
    var d = new Date();
    var dstr = d.getFullYear() + "-";
    if (d.getMonth() < 9) dstr += "0";
    dstr += d.getMonth()+1 + "-";
    if (d.getDate() < 9) dstr += "0";
    dstr += d.getDate();
    return dstr;
}

function fmt_time() {
    var d = new Date();
    var dstr = d.getFullYear() + "-";
    if (d.getMonth() < 10) dstr += "0";
    dstr += d.getMonth() + 1 + "-";
    if (d.getDate() < 10) dstr += "0";
    dstr += d.getDate();
    dstr += " "+d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +
        ":" + d.getMilliseconds()
    return dstr;
}
var staticlogfile = function (filename, mimetype, res) {
    //const fs = require('fs');
    console.log(filename);
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
const router = express.Router();
// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
// Set Content-Type for all responses for these routes

/**
 * GET /attend/add
 *
 * Display a page of books (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    let macaodailyNode = "";
    if (fs.existsSync("tdm" + news_filename())) {
        macaodailyNode += fs.readFileSync("tdm" + news_filename(), 'utf8');
    } else {
        res.redirect(`${req.baseUrl}/sync`);
        return;
    }
    if (fs.existsSync(news_filename())) {
        macaodailyNode += fs.readFileSync(news_filename(), 'utf8');
    } else {
        res.redirect(`${req.baseUrl}/sync`);
        return;
    }

    res.render('localnews/index.pug', {
        profile: req.user,
        newscontent: macaodailyNode
    });
});
router.get('/sync', (req, res, next) => {
    if (req.user) {
        fs.writeFile("tdm" + news_filename(), news_filename(), (err) => { if (err) throw err; });
        NewsGet('www.tdm.com.mo', '/global/xml/livenews_rss.php', "tdm" + news_filename());
        if (!fs.existsSync(news_filename())) {
            app.filename = news_filename();
            app.index_ = 0;
            app.link_paths = [];
            let date_ = modaily_date();
            NewsNodeGet("www.macaodaily.com", date_ + 'node_2.htm', app.link_paths, date_);
            console.log(app.link_paths);
            app.run();
        }
    } 
    let lnk_path = 'D:/code/mypy-master/localnews_link.lnk';
    if (fs.existsSync(lnk_path)) {
        console.log("sync db");
        let bat = spawn('cmd.exe', ['/c', lnk_path]);
        bat.stdout.on('data', (data) => { console.log(data.toString()); });
        bat.stderr.on('data', (data) => { console.log(data.toString()); });
        bat.on('exit', (code) => { console.log(`Child exited with code ${code}`); });
     } else {
        http.get(
         {
                    hostname: '192.168.102.31',
                    port: 80,
                    path: '/internal/localnews/sync',
                    method: 'GET'
                },
                (resp) => {
                    resp.setEncoding('utf8');
                    resp.on('data', (d) => { console.log(d.toString()); });
                    resp.on('end', () => { console.log('sync local news from 114 end');  });
                }).on('error', (e) => {
                    console.log(e);
                });
    }   
            res.redirect(`${req.baseUrl}`);
});
router.get('/list', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    getModel().listMore( 10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
            res.render('localnews/list.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor
            });
        }
    );
});
router.get('/mine', require('connect-ensure-login').ensureLoggedIn(), (req, res, next) => {
    getModel().listBy(
        req.user.id,
        30,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('localnews/list.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor
            });
        }
    );
});
router.get('/tdmlist',  (req, res, next) => {
    getModel().tdmlist(
        30,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('localnews/tdmlist.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor
            });
        }
    );
});
router.get('/govnewslist', (req, res, next) => {
    getModel().govnewslist(
        30,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('localnews/tdmlist.pug', {
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
    res.render('localnews/form.pug', {
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
            data.createdBy = req.user.displayName;
            data.createdById = req.user.id;
        } else {
            data.createdBy = 'Anonymous';
        }
        data.title = data.newstxt.split("\n")[0];
        getModel().create(req.user.id, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }          
            res.redirect(`${req.baseUrl}/${savedData.id}`);
        });
    }
);

router.get('/:book', (req, res, next) => {
    console.log("read");
    getModel().read(req.user.id,req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.render('localnews/view.pug', {
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
        console.log(entity);
        res.render('localnews/form.pug', {
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
    images.multer.single('image'), require('connect-ensure-login').ensureLoggedIn(),
    (req, res, next) => {
        const data = req.body;
        data.title = data.newstxt.split("\n")[0];
        getModel().update(req.user.id, req.params.book, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }
            res.redirect(`${req.baseUrl}/${savedData.id}`);
        });
    }
);

/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/:book/delete', (req, res, next) => {
    console.log(req.params.book, "delete");
    getModel().delete(req.user.id, req.params.book, (err) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect(req.baseUrl);
    });
});
router.get('/macaodaily/:book', (req, res, next) => {
    var host_ = "www.macaodaily.com";
    var path_ = modaily_date() + req.params.book;
    http.get({ hostname: host_, port: 80, path: path_, method: 'GET', headers: { 'Cookie': "this.session_id"  } },
        (get_respone) => {
            get_respone.on('data', (d) => {
                var html = d.toString();
                let index_ = html.indexOf("founder");
                if (index_ > 0) {
                    res.render('localnews/index.pug', {
                        profile: req.user,
                        newscontent: html.substring(index_)
                    });
                } else {
                    res.end(html);
                }
                
            });
        }).on('error', (e) => { console.log(e); }
        );
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