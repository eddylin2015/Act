'use strict';
const mysql = require('mysql');
const config = require('../../config');
const options = {
    host: config.get('ACTMYSQL_HOST'),
    user: config.get('ACTMYSQL_USER'),
    password: config.get('ACTMYSQL_PASSWORD'),
    database: config.get('ACTMYSQL_DATABASE')
};
const pool = mysql.createPool(options);

function ReadStafbyId(STAFID,cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `studinfo` WHERE stud_ref=?;', [STAFID], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function ReadActDefbyId(act_c_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `attrollcall_course_def` WHERE act_c_id=?;', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
//User_List:User_List,
function User_List(cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `studinfo` ', [], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}
//User_Update:User_Update,
async function User_Update(aObj, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(aObj);
        for (let i = 0; i < alist.length; i++) {
            let val = aObj[alist[i]];
            let ar_ = alist[i].split('_');
            let fieldname = ar_[1].replace("-", "_");
            let actcid = ar_[2];
            if (fieldname.startsWith("SPK")) {
                val = val.match(/^[0-9]+[.]*[0-9]*$/);
                if (val == null) continue;
            }
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update studinfo set ${fieldname}=? where stud_ref=?;`, [val, actcid], (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        cb(null, Math.floor(cnt / 100));
        connection.release();
    });
}
//User_Add:User_Add,
function User_Add(staf_ref,cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        let data={stud_ref:staf_ref}
        connection.query(
            'insert into `studinfo` set  ? ', [data], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}


function ReadActDef(cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `attrollcall_course_def` ', [], (err, results) => {
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
            let fieldname = ar_[1].replace("-", "_");
            let actcid = ar_[2];
            if (fieldname.startsWith("SPK")) {
                val = val.match(/^[0-9]+[.]*[0-9]*$/);
                if (val == null) continue;
            }
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update attrollcall_course_def set ${fieldname}=? where act_c_id=?;`, [val, actcid], (err, res) => {
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
    mysqlcfg.esdbPool.getConnection(function (err, conn) {
        if (err) { cb(err); return; }
        conn.query('INSERT INTO `attrollcall_lesson` SET ? ', [data], (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            //read(res.insertId, cb);
            CloneActLessonStudList(data.act_c_id, res.insertId, (err, inc_cnt) => {
            cb(null, res.insertId, inc_cnt);
            conn.release();
            });
        });
    });
}

async function CloneActLessonStudList(act_c_id, al_id, cb) {
    pool.getConnection(async function (err, connection) {
        let cnt = 0
        connection.query(
            'SELECT * FROM `attrollcall_stud` where act_c_id=? ', [act_c_id], async function (err, results) {
                if (err) { cb(err); return; }
                for (let i = 0; i < results.length; i++) {
                    let r = results[i];
                    let data = { aa_id: 0, al_id: al_id, act_c_id: act_c_id, stud_ref: r.stud_ref, classno: r.classno, seat: r.seat, c_name: r.c_name }
                    cnt += await new Promise((resolve, reject) => {
                        connection.query('INSERT INTO `attrollcall_attend` SET ?', data, (err, res) => {
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

function ReadActLessons(act_c_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `attrollcall_lesson` where act_c_id=? ', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function ReadActStud(act_c_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `attrollcall_stud` where act_c_id=? order by classno,seat', [act_c_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

function DeleteActStud(act_c_id, as_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'Delete FROM `attrollcall_stud` where act_c_id=? and as_id=?', [act_c_id, as_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

async function ReadStudByClassSeat(ByClassSeat, act_c_id, fn, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            `SELECT stud_ref,curr_class as classno,curr_seat as seat,c_name FROM studinfo where ${ByClassSeat} order by curr_class,curr_seat`, [], async function (err, results) {
                if (err) { cb(err); return; }
                let cnt = 0;
                for (let row of results) {
                    row["as_id"] = 0
                    row["act_c_id"] = act_c_id
                    row["activeName"] = fn
                    cnt += await new Promise((resolve, reject) => {
                        connection.query(`insert  attrollcall_stud set  ?`, [row], (err, res) => {
                            if (err) { console.log(err); reject(err); }
                            resolve(100);
                        });
                    });
                }
                ReadActStud(act_c_id, cb)
                connection.release();
            });
    });
}

async function UpdateActStud(data, act_c_id, fn, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(data);
        for (let i = 0; i < alist.length; i++) {
            let key = alist[i];
            let val = data[key]
            let li = key.split('_');
            let aa_id = li[li.length - 1]
            let fieldname = li[0]
            for (let i = 1; i < li.length - 1; i++) fieldname += "_" + li[i]
            cnt += await new Promise((resolve, reject) => {
                connection.query(`insert  attrollcall_stud set ${fieldname}=? where aa_id = ?`, [val, aa_id], (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        //cb(null, Math.floor(cnt / 100));
        ReadActStud(act_c_id, cb)
        connection.release();
    });
}

function ReadActLessonStud(al_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'SELECT * FROM `attrollcall_attend` where al_id=? order by classno,seat', [al_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

async function IncActLessonStudByClassSeat(ByClassSeat, act_c_id, al_id,fn, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            `SELECT stud_ref,curr_class as classno,curr_seat as seat,c_name FROM studinfo where ${ByClassSeat} order by curr_class,curr_seat`, [], async function (err, results) {
                if (err) { cb(err); return; }
                let cnt = 0;
                for (let row of results) {
                    row["aa_id"] = 0
                    row["al_id"] = al_id
                    row["act_c_id"] = act_c_id
                    cnt += await new Promise((resolve, reject) => {
                        connection.query(`insert  attrollcall_attend set  ?`, [row], (err, res) => {
                            if (err) { console.log(err); reject(err); }
                            resolve(100);
                        });
                    });
                }
                ReadActLessonStud(al_id, cb)
                connection.release();
            });
    });
}

function DeleteActLessonStud(act_c_id,al_id,aa_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
            return;
        }
        connection.query(
            'Delete FROM `attrollcall_attend` where act_c_id=? and al_id=? and aa_id=?', [act_c_id,al_id,aa_id], (err, results) => {
                if (err) { cb(err); return; }
                cb(null, results);
                connection.release();
            });
    });
}

async function UpdateActLessonStud(data, al_id, cb) {
    pool.getConnection(async function (err, connection) {
        if (err) { cb(err); return; }
        let cnt = 0;
        let alist = Object.keys(data);
        for (let i = 0; i < alist.length; i++) {
            let key = alist[i];
            let val = data[key]
            let li = key.split('_');
            let aa_id = li[li.length - 1]
            let fieldname = li[0]
            for (let i = 1; i < li.length - 1; i++) fieldname += "_" + li[i]
            cnt += await new Promise((resolve, reject) => {
                connection.query(`update attrollcall_attend set ${fieldname}=? where aa_id = ?`, [val, aa_id], (err, res) => {
                    if (err) { console.log(err); reject(err); }
                    resolve(100);
                });
            });
        }
        //cb(null, Math.floor(cnt / 100));
        ReadActLessonStud(al_id, cb)
        connection.release();
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

module.exports = {
    createSchema: createSchema,
    ReadStafbyId:ReadStafbyId,
    ReadActDefbyId: ReadActDefbyId,
    ReadActDef: ReadActDef,
    UpdateActDef: UpdateActDef,
    readclassnostud: readclassnostud,
    ReadActLessons: ReadActLessons,
    CreateActLesson: CreateActLesson,
    CloneActLessonStudList: CloneActLessonStudList,
    ReadActLessonStud: ReadActLessonStud,
    IncActLessonStudByClassSeat:IncActLessonStudByClassSeat,
    DeleteActLessonStud:DeleteActLessonStud,
    UpdateActLessonStud: UpdateActLessonStud,
    ReadActStud: ReadActStud,
    UpdateActStud: UpdateActStud,
    DeleteActStud: DeleteActStud,
    ReadStudByClassSeat: ReadStudByClassSeat,
    User_List:User_List,
    User_Update:User_Update,
    User_Add:User_Add,
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
    const connection = mysql.createConnection(extend({
        multipleStatements: true
    }, config));
    connection.query(
` CREATE TABLE IF NOT EXISTS \`act\`.\`attrollcall_attend\` (
  \`aa_id\` int NOT NULL AUTO_INCREMENT,
  \`al_id\` int DEFAULT NULL,
  \`act_c_id\` int DEFAULT NULL,
  \`stud_ref\` varchar(45) DEFAULT NULL,
  \`classno\` varchar(45) DEFAULT NULL,
  \`seat\` varchar(45) DEFAULT NULL,
  \`c_name\` varchar(45) DEFAULT NULL,
  \`in_type\` varchar(45) DEFAULT NULL,
  \`in_time\` varchar(45) DEFAULT NULL,
  \`out_type\` varchar(45) DEFAULT NULL,
  \`out_time\` varchar(45) DEFAULT NULL,
  \`hours\` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (\`aa_id\`),
  KEY \`aakey\` (\`al_id\`,\`stud_ref\`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS \`act\`.\`attrollcall_course_def\` (
  \`act_c_id\` int NOT NULL AUTO_INCREMENT,
  \`activeName\` varchar(30) NOT NULL DEFAULT '',
  \`teacher\` varchar(8) NOT NULL DEFAULT '',
  \`SPK\` smallint NOT NULL DEFAULT '1',
  \`pwd\` varchar(45) DEFAULT NULL,
  \`pwd_adm\` varchar(45) DEFAULT NULL,
  PRIMARY KEY (\`act_c_id\`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS \`act\`.\`attrollcall_lesson\` (
  \`al_id\` int NOT NULL AUTO_INCREMENT,
  \`act_c_id\` int DEFAULT NULL,
  \`al_datetime\` varchar(45) DEFAULT NULL,
  \`lesson\` varchar(45) DEFAULT NULL,
  PRIMARY KEY (\`al_id\`),
  KEY \`alkey\` (\`act_c_id\`,\`al_datetime\`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS \`act\`.\`attrollcall_stud\` (
  \`as_id\` int NOT NULL AUTO_INCREMENT,
  \`act_c_id\` int NOT NULL,
  \`activeName\` varchar(45) DEFAULT NULL,
  \`stud_ref\` varchar(45) NOT NULL,
  \`classno\` varchar(45) DEFAULT NULL,
  \`seat\` int DEFAULT NULL,
  \`c_name\` varchar(45) DEFAULT NULL,
  PRIMARY KEY (\`as_id\`),
  KEY \`askey\` (\`act_c_id\`,\`stud_ref\`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS \`act\`.\`studinfo\` (
  \`stud_ref\` varchar(11) NOT NULL,
  \`dsej_ref\` varchar(11) DEFAULT NULL,
  \`c_name\` varchar(45) DEFAULT NULL,
  \`curr_class\` varchar(45) DEFAULT NULL,
  \`curr_seat\` int DEFAULT NULL,
  PRIMARY KEY (\`stud_ref\`),
  KEY \`cno_seat\` (\`curr_class\`,\`curr_seat\`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
        (err) => {
            if (err) {
                throw err;
            }
            console.log('Successfully created schema');
            connection.end();
        }
    );
}