function digformat(x) { document.write(x.toFixed(2)); }
function StarFlag(x) {
    if (x > 0 && x < 60) {
        return "*";
    } else {
        return "&nbsp;"
    }
}
TMKfmt_fmt_classno2name = function (txt) {
    txt = txt.replace("P", "小");
    txt = txt.replace("SC", "高");
    txt = txt.replace("SG", "初");
    txt = txt.replace("1", "一");
    txt = txt.replace("2", "二");
    txt = txt.replace("3", "三");
    txt = txt.replace("4", "四");
    txt = txt.replace("5", "五");
    txt = txt.replace("6", "六");
    txt = txt.replace("A", "信");
    txt = txt.replace("B", "望");
    txt = txt.replace("C", "愛");
    txt = txt.replace("D", "善");
    txt = txt.replace("E", "樂");
    return txt;
};
TMKfmt_fmt_act2grade = function (m) {
    if (m >= 95) { return "A&nbsp;"; }
    else if (m >= 90) { return "A-"; }
    else if (m >= 85) { return "B+"; }
    else if (m >= 80) { return "B&nbsp;"; }
    else if (m >= 75) { return "B-"; }
    else if (m >= 70) { return "C+"; }
    else if (m >= 65) { return "C&nbsp;"; }
    else if (m >= 60) { return "C-"; }
    else { return "D&nbsp;"; }
};
function docclassn(x) {
    document.write(TMKfmt_fmt_classno2name(x));
}
function docqrimg(sess, classno, seat, dejref) {
    var qrurl = '/qr/' + sess + classno;
    if (classno.indexOf('P')==0 || classno.indexOf('p')==0) qrurl += "R";
    if (seat < 10) qrurl += "0";
    qrurl += seat + dejref + ".jpg";
    document.write('<img width = "90px"  id = "qr_1" style = "padding-right:0;margin:0" src = ' + qrurl + '>' );
}
function docprtgrade(term, mark1, mark2, mark3) {
    if (term == 1) document.write(mark1);
    if (term == 2) document.write(mark2);
    if (term == 3) document.write(mark3);
}
function docprtmark2grade(term, mark1, mark2, mark3) {
    if (term == 1) document.write(TMKfmt_fmt_act2grade(mark1));
    if (term == 2) document.write(TMKfmt_fmt_act2grade(mark2));
    if (term == 3) document.write(TMKfmt_fmt_act2grade(mark3));
}
function docprtmarktotal(term, mark1, mark2, mark3) {
    if (term == 1) document.write(mark1.toFixed(2));
    if (term == 2) document.write(mark2.toFixed(2));
    if (term == 3) document.write(mark3.toFixed(2));
}
function docprt(term, crsname, t1, e1, total1, t2, e2, total2, t3, e3, total3) {
    document.write("<tr>");
    document.write("<td class=mk0,width=150px>");
    document.write(crsname);
    document.write("<td class=mk1>");  document.write(t1);
    document.write("<td class=mk1>");  document.write(e1);
    document.write("<td class=mke>");  if (total1 > 0) document.write(total1.toFixed(2));
    document.write(StarFlag(total1));
    document.write("<td class=mk1>");   document.write(t2);
    document.write("<td class=mk1>");   document.write(e2);
    document.write("<td class=mke>");   if (total2 > 0) document.write(total2.toFixed(2));
    document.write(StarFlag(total2));
    document.write("<td class=mk1>");   document.write(t3);
    document.write("<td class=mk1>");   document.write(e3);
    document.write("<td class=mke>");   if (total3 > 0) document.write(total3.toFixed(2));
    document.write(StarFlag(total3));
}