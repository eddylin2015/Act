
'use strict';
const express = require('express');
const images = require('./images');
const router = express.Router();

// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.post('/ExpXls.php', images.multer.single('image'), function (req, res, next) {
    let fn = req.query.filename;
    //console.log(fn);
    res.setHeader("Content-type", "application/vnd.ms-excel");
    res.setHeader("Content-Disposition", "attachment; filename=" + encodeURI(fn) + ";");
    res.write('<HTML xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">');
    res.write('<head><meta http-equiv="content-type" content="application/vndms-excel; charset=utf-8"></head>');
    res.write('<body><table><tbody>')
    res.write(req.body.CSVFrmPOSTNAME);
    res.write('</tbody></table></body></html>');
    res.end();
});

module.exports = router;
