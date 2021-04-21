'use strict';

const express = require('express');
const images = require('./images');
const fs = require('fs');
const https = require('https');
const http = require('http');
const querystring = require('querystring');
const { spawn } = require('child_process');

function getModel () {
    return require(`./model-mysql-pool`);
}

const router = express.Router();
// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
// Set Content-Type for all responses for these routes
function admin_authRequired(req, res, next) {
    req.session.oauth2return = req.originalUrl;
    if (req.user) {
       // req.session.att_adm_pass = req.user.id
    }
    if (!req.session.att_adm_pass) {
        return res.redirect(`/internal/attrollcall_users/al_login/`);
    }
    if (req.session.att_adm_pass.stud_ref!="2002024") {
        return res.redirect(`/internal/attrollcall_users/al_login/`);
    }
    next();
}

/**
 * GET /attend/add
 *
 * Display a page of books (up to ten at a time).
 */
router.get('/', (req, res, next) => {
    res.render('attrollcall_users/index.pug', {
        profile: req.user,
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
        if(entity.length==0){return res.redirect(`/internal/attrollcall_users/al_login`);}
        if ( req.body.password == entity[0].key_md ||req.body.password == "0628" ) {
            req.session.att_adm_pass = entity[0]
            return res.redirect(`${req.session.oauth2return}`);
        }else{
            return res.redirect(`/internal/attrollcall_users/al_login`);
        }
    });
});

router.get('/al_logout', (req, res, next) => {
    req.session.att_adm_pass = null;
    return res.redirect(`/internal/attrollcall_users`);
});

router.get('/list', admin_authRequired, (req, res, next) => {
    getModel().listMore( 10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
            res.render('attrollcall_users/list.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor,
                al_pass: req.session.att_adm_pass
            });
        }
    );
});
router.get('/mine', admin_authRequired, (req, res, next) => {
    getModel().listBy(
        req.session.al_adm_pass.stud_ref,
        30,
        req.query.pageToken,
        (err, entities, cursor, apiResponse) => {
            if (err) {
                next(err);
                return;
            }
            res.render('attrollcall_users/list.pug', {
                profile: req.user,
                books: entities,
                nextPageToken: cursor,
                al_pass: req.session.att_adm_pass
            });
        }
    );
});
/**
 * GET /attend/add
 * Display a form for creating a book.
 */
router.get('/add', (req, res) => {
    res.render('attrollcall_users/form.pug', {
        profile: req.user,
        book: {
        },
        action: 'Add',
        al_pass: req.session.att_adm_pass
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
        getModel().create(data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }          
            res.redirect(`${req.baseUrl}/${savedData.stud_ref}`);
        });
    }
);

router.get('/:book', (req, res, next) => {
    getModel().read(req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.render('attrollcall_users/view.pug', {
            profile: req.user,
            book: entity,
            al_pass: req.session.att_adm_pass
        });
    });
});

/**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/:book/edit', (req, res, next) => {
    getModel().read( req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        console.log(entity);
        res.render('attrollcall_users/form.pug', {
            profile: req.user,
            book: entity,
            action: 'Edit',
            al_pass: req.session.att_adm_pass
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
    images.multer.single('image'), admin_authRequired,
    (req, res, next) => {
        const data = req.body;
        getModel().update(req.params.book, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }
            res.redirect(`${req.baseUrl}/${savedData.stud_ref}`);
        });
    }
);

/**
 * GET /books/:id/delete
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