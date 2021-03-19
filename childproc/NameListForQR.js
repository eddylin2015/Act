
'use strict';
const mysql = require('mysql');
var fs = require('fs');
const mysqlcfg = require('../routes/mysql250/mysql250config');

const conn = mysql.createConnection(mysqlcfg.mysql250options);


let NameList=[];
conn.query(
            "SELECT stud_ref,dsej_ref,c_name,e_name,curr_class,curr_seat FROM eschool.studinfo where curr_class>'P';",[  ],
            (err, results) => {
                if (err) {
                    console.log(err);return;
                }
                for(let i=0;i<results.length;i++){
                    let row=results[i];
                    let fseat=results[i].curr_seat<10?"0":""; 
                    let fclr=results[i].curr_class.length==3?"R":""; 
                    NameList.push(`2021${row.curr_class}${fclr}${fseat}${row.curr_seat}${row.dsej_ref}`);
                }                
                console.log(NameList);
                fs.writeFileSync('c:/photo2021/qrcode/namelist.txt', NameList.join('\n'), 'utf8');
                
            }
        );
conn.end();

