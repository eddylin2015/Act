﻿'use strict';
const mysql = require('mysql');
const mysqlcfg = require('../mysql250/mysql250config');

const pool = mysqlcfg.esdbPool;


function ReadActDefbyId(act_c_id,cb) {
    //ALTER TABLE `eschool`.`active_course_def` ADD COLUMN `pwd_adm` VARCHAR(45) NULL AFTER `pwd`;
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `active_course_def` WHERE act_c_id=?;', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function readclassact(staf_ref, cno,sid, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `mrs_stud_active` WHERE `classno` = ? order by seat', cno, (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function ReadActivebyACTCID(actcid, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `mrs_stud_active` WHERE `act_c_id` = ? order by seat', actcid, (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

async function UpdateAct(aObj,sid,aot, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(aObj);
        for (let i = 0; i < alist.length; i++) {
            let val = aObj[alist[i]];
            let ar_ = alist[i].split('_');
            let fieldname = ar_[1].replace("-","_");
            let stud_ref = ar_[2];
            if(fieldname.startsWith("grade")){
              val = val.match(/^[0-9]+[.]*[0-9]*$/); 
              if (val==null) continue; 
              if(aot==1 && (fieldname=="grade2"||fieldname=="grade3")) continue;
              if(aot==2 && (fieldname=="grade1"||fieldname=="grade3")) continue;
              if(aot==2 && (fieldname=="grade1"||fieldname=="grade2")) continue;
            }
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update mrs_stud_active set ${fieldname}=? where stud_ref=? and session_id=?;`, [val, stud_ref,sid], (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        cb(null, Math.floor(cnt / 100));
        connection.release();
    });
}

function ReadActDef(cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `active_course_def` ', [], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

async function UpdateActDef(aObj, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(aObj);
        for (let i = 0; i < alist.length; i++) {
            let val = aObj[alist[i]];
            let ar_ = alist[i].split('_');
            let fieldname = ar_[1].replace("-","_");
            let actcid = ar_[2];
            if(fieldname.startsWith("SPK")){
              val = val.match(/^[0-9]+[.]*[0-9]*$/); 
              if (val==null) continue; 
            }
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update active_course_def set ${fieldname}=? where act_c_id=?;`, [val, actcid], (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        cb(null, Math.floor(cnt / 100));
        connection.release();
    });
}

function CreateActLesson(data, cb) {
    //console.log(data);
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query('INSERT INTO `active_lesson` SET ? ', [data], (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            //read(res.insertId, cb);
            CloneActLessonStudList(data.act_c_id,res.insertId,(err, inc_cnt) => {

                cb(null,res.insertId,inc_cnt);    
                conn.release();
            });
        });
    });
}
async function CloneActLessonStudList(act_c_id,al_id, cb) {
    pool.getConnection(async function (err, connection) {
        let cnt=0
        connection.query(
            'SELECT * FROM `active_stud` where act_c_id=? ', [act_c_id],async function (err, results) {
                if (err) { cb(err); return; }
                for(let i=0;i<results.length;i++){
                    let r=results[i];
                    let data={aa_id:0,al_id:al_id,act_c_id:act_c_id,stud_ref:r.stud_ref,classno:r.classno,seat:r.seat,c_name:r.c_name}
                cnt += await new Promise((resolve, reject) => {
                    connection.query('INSERT INTO `active_attend` SET ?', data, (err, res) => {
                        if (err) { console.log(err); reject(err); }
                        resolve(100);
                    });
                });
                }
            });
        cb(null, Math.floor(cnt / 100));
        connection.release();
    });
}
function ReadActLessons(act_c_id,cb){
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `active_lesson` where act_c_id=? ', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
function ReadActStud(act_c_id,cb){
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `active_stud` where act_c_id=? order by classno,seat', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
function DeleteActStud(act_c_id,as_id,cb){
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'Delete FROM `active_stud` where act_c_id=? and as_id=?', [act_c_id,as_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
async function ReadStudByClassSeat(ByClassSeat,act_c_id,fn,cb){
    pool.getConnection(async function (err, connection)  {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            `SELECT stud_ref,curr_class as classno,curr_seat as seat,c_name FROM studinfo where ${ByClassSeat} order by curr_class,curr_seat`, [], async function (err, results)  {
                if (err) { cb(err); return; }
                let cnt=0;
                for(let row of results){
                    row["as_id"]=0
                    row["act_c_id"]=act_c_id
                    row["activeName"]=fn
                    cnt += await new Promise((resolve, reject) => {
                        connection.query(`insert  active_stud set  ?`,[row] , (err, res) => {
                            if (err) { console.log(err); reject(err); }
                            resolve(100);
                        });
                    });
        
                }
                ReadActStud(act_c_id,cb)
                connection.release();
            });
    });
}
async function UpdateActStud(data,act_c_id,fn,cb){
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(data);
        for (let i = 0; i < alist.length; i++) {
            let key = alist[i];
            let val= data[key]
            let li = key.split('_');               
            let aa_id=li[li.length-1]
            let fieldname=li[0]
            for(let i=1;i<li.length-1;i++) fieldname+="_"+li[i]
            cnt += await new Promise((resolve, reject) => {
                connection.query(`insert  active_stud set ${fieldname}=? where aa_id = ?`,[val,aa_id] , (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        //cb(null, Math.floor(cnt / 100));
        ReadActStud(act_c_id,cb)
        connection.release();
    });
}
function ReadActLessonStud(al_id,cb){
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `active_attend` where al_id=? order by classno,seat', [al_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
async function UpdateActLessonStud(data,al_id,cb){
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(data);
        for (let i = 0; i < alist.length; i++) {
            let key = alist[i];
            let val= data[key]
            let li = key.split('_');               
            let aa_id=li[li.length-1]
            let fieldname=li[0]
            for(let i=1;i<li.length-1;i++) fieldname+="_"+li[i]
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update active_attend set ${fieldname}=? where aa_id = ?`,[val,aa_id] , (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        //cb(null, Math.floor(cnt / 100));
        ReadActLessonStud(al_id,cb)
        connection.release();
    });
}
function ReadClassStudAct(cno, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            [" select act_c_id as id,a.stud_ref,a.curr_seat,a.c_name,grade1 ",
            " from ",
            "  ( select stud_ref,curr_seat,c_name from  studinfo where curr_class=?) as a",
            "left join",
            "( select act_c_id,stud_ref,seat,c_name,grade1 from  mrs_stud_active where classno=?) as b",
            " on a.stud_ref=b.stud_ref",
            "order by curr_seat"].join(" "),
            [cno,cno], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
async function RegStudAct(sid, cno,actcid, aObj, rObj, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        if (aObj) {
            let alist = Object.keys(aObj);
            for (let i = 0; i < alist.length; i++) {
                let studref = alist[i];
                let li = aObj[studref].split(':');               
                let seat = li[0];
                let name = li[1];
                let data = {stud_ref: studref,session_id:sid,classno: cno,seat: seat,act_c_id:actcid, c_name: name }
                cnt += await new Promise((resolve, reject) => {
                    connection.query('INSERT INTO `mrs_stud_active` SET ?', data, (err, res) => {
                        if (err) { console.log(err); reject(err); }
                        resolve(100);
                    });
                });
            }
        }
        if (rObj) {
            let rlist = Object.keys(rObj);
            for (let i = 0; i < rlist.length; i++) {
                let studref = rlist[i];
                let li = rObj[studref].split(':');
                let seat = li[0];
                let name = li[1];
                let scid = li[2];
                cnt += await new Promise((resolve, reject) => {
                    connection.query('delete from mrs_stud_active where  session_id=? and stud_ref=? and grade1<1 ', [sid,studref], (err, res) => {
                        if (err) { console.log(err); reject(err); }
                        resolve(100);
                    });
                });
            }
        }
        cb(null, Math.floor(cnt / 100));
        connection.release();
    });
}

function pm2g(m) {
    return m >= 95 ? "A " : m >= 90 ? "A-" : m >= 85 ? "B+" : m >= 80 ? "B " : m >= 75 ? "B-" : m >= 70 ? "C+" : m >= 65 ? "C " : m >= 60 ? "C-" : "D "
}

function ReadMarksysAuth(staf_ref, cb) {
    pool.getConnection(function (err, connection) {
        if (err) { cb(err); return; }
        connection.query(
            'SELECT * FROM `mrs_session_def` where `curr_flag` = 1;' +
            'SELECT UserID,UserName,RoleID,staf_ref,classno,SPK FROM `es_user` where `staf_ref` = ?;' +
            'SELECT * FROM `mrs_course_detail` WHERE `staf_ref` = ? ; ' +
            'SELECT * FROM `mrs_course_detail` WHERE `classno` in (select classno from es_user where staf_ref= ? ) ',
            [staf_ref, staf_ref, staf_ref], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function readclassnostud(id, cb) {
    pool.getConnection(function (err, connection) {
        connection.query(
            'SELECT stud_ref,curr_class,curr_seat,c_name,e_name FROM  studinfo  where curr_class= ? ', id, (err, res) => {
                if (!err && !res.length) {
                    err = { code: 404, message: 'Not found' };
                }
                if (err) { cb(err); return; }
                cb(null, res);
                connection.release();
            });
    });
}

async function UpdateMarkArr(alist, cdids, aot, cb) {
    pool.getConnection(async function (err, conn) {
        if (err) { cb(err); return; }
        let cnt = 0;
        for (let i = 0; i < alist.length; i++) {
            let ar = alist[i];
            let sid = ar[0];
            let cdid = ar[1]; //cdid = cdid.match(/^[0-9]+$/);
            let std = ar[2];  //std = std.match(/^[7-9][0-9A-F][0-9]+[A-B]$/);
            if (cdids.indexOf(cdid) > -1) {
                let mrk = null;
                switch (Number(aot)) {
                    case 1: mrk = { "t1": ar[5], "e1": ar[6] }; break;
                    case 2: mrk = { "t2": ar[7], "e2": ar[8] }; break;
                    case 3: mrk = { "t3": ar[9], "e3": ar[10], "pk": ar[11] }; break;
                }
                cnt += await new Promise((resolve, reject) => {
                    conn.query(`update mrs_stud_course set ? where session_id=? and stud_ref=? and course_d_id=?`,
                        [mrk, sid, std, cdid], (err, res) => {
                            if (err) { console.log(err); reject(err); }
                            resolve(100);
                        });
                });
            }
        }
        cb(null, Math.floor(cnt / 100));
        conn.release();
    });
}

function read(staf_ref, id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) { cb(err); return; }
        connection.query(
            'SELECT * FROM `mrs_stud_course` WHERE `course_d_id` = ? ', id, (err, results) => {
                if (!err && !results.length) {
                    err = { code: 404, message: 'Not found' };
                }
                if (err) { cb(err); return; }
                cb(null, results[0]);
                connection.release();
            });
    });
}
//Course Sub ITEM END..
module.exports = {
    createSchema: createSchema,
    readclassact: readclassact,
    ReadClassStudAct:ReadClassStudAct,
    RegStudAct:RegStudAct,
    ReadActDefbyId:ReadActDefbyId,
    UpdateMarkArr: UpdateMarkArr,
    UpdateAct: UpdateAct,
    ReadActDef:ReadActDef,
    UpdateActDef:UpdateActDef,
    ReadMarksysAuth: ReadMarksysAuth,
    read: read,
    readclassnostud: readclassnostud,
    ReadActivebyACTCID:ReadActivebyACTCID,
    ReadActLessons:ReadActLessons,
    CreateActLesson:CreateActLesson,
    CloneActLessonStudList:CloneActLessonStudList,
    ReadActLessonStud:ReadActLessonStud,
    UpdateActLessonStud:UpdateActLessonStud,
    ReadActStud:ReadActStud,
    UpdateActStud:UpdateActStud,
    DeleteActStud:DeleteActStud,
    ReadStudByClassSeat:ReadStudByClassSeat

};

if (module === require.main) {
    const prompt = require('prompt');
    prompt.start();
    console.log(
        `Running this script directly will allow you to initialize your mysql
    database.\n This script will not modify any existing tables.\n`);
    prompt.get(['user', 'password'], (err, result) => {
        if (err) {
            return;
        }
        createSchema(result);
    });
}

function createSchema(config) {
    /*
    const connection = mysql.createConnection(extend({
        multipleStatements: true
    }, config));
    connection.query(
   `CREATE DATABASE IF NOT EXISTS \`deptwork\`
    DEFAULT CHARACTER SET = 'utf8'
    DEFAULT COLLATE 'utf8_general_ci';
    USE \`deptwork\`;
    CREATE TABLE IF NOT EXISTS \`deptwork\`.\`watchguard\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`stime\` VARCHAR(255) NULL,
      \`etime\` VARCHAR(255) NULL,
      \`incoming\` VARCHAR(255) NULL,
      \`outgoing\` VARCHAR(255) NULL,
      \`reccnt\` VARCHAR(255) NULL,
    PRIMARY KEY (\`stime\`));`,
        (err) => {
            if (err) {
                throw err;
            }
            console.log('Successfully created schema');
            connection.end();
        }
    );*/
}