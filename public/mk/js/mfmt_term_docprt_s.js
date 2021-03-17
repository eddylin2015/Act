function digformat(x) { document.write(x.toFixed(2)); }

function StarFlag(x) {
    if ($.isNumeric(x)) {
        if (x >= 0 && x < 60) { return "*"; } else { return "&nbsp;"; }
    } 
    else if (x.startsWith('D')) {  return "*";  }
    else{ return "&nbsp;" }
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
    //ite.SetMarkGrade('100=A+;95=A;90=A-;85=B+;80=B;75=B-;70=C+;65=C;61=C-;60=D;0=F');
    if (m == 100) { return "A+"; }
    else if (m >= 95) { return "A&nbsp;"; }
    else if (m >= 90) { return "A-"; }
    else if (m >= 85) { return "B+"; }
    else if (m >= 80) { return "B&nbsp;"; }
    else if (m >= 75) { return "B-"; }
    else if (m >= 70) { return "C+"; }
    else if (m >= 65) { return "C&nbsp;"; }
    else if (m >= 61) { return "C-"; }
    else if (m == 60) { return "D&nbsp;"; }    
    else { return "F&nbsp;"; }
};

function docclassn(x) {
    document.write(TMKfmt_fmt_classno2name(x));
}

function docqrimg(sess, classno, seat, dejref) {
    var qrurl = '/qr/' + sess + classno;
    if (classno.startsWith('P') || classno.startsWith('p')) qrurl += "R";
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

function docprtmarktotal(term, mark1, mark2, mark3, mg) {
    if (mg == '2' || mg=='g') {
        mark1 = TMKfmt_fmt_act2grade(mark1);
        mark2 = TMKfmt_fmt_act2grade(mark2);
        mark3 = TMKfmt_fmt_act2grade(mark3);
    }
    if (term == 1) document.write( mark1);
    if (term == 2) document.write( mark2);
    if (term == 3) document.write( mark3);
}

cttypedisc = function (cttype) {
    var t = "";
    if (cttype == "必修") { t = "基礎學科"; }
    else if (cttype == "必選") { t = "拓展及自選學科"; }
    else if (cttype == "職業文化") { t = "社會文化學科"; }
    else if (cttype == "職業專業") { t = "專業科技及實踐學科"; }
    else { t = cttype; }
    return "<td class=mkf colspan=4>[" + t + "]";
};
mrk2g = function (x, mg) {
    return mg == 2 || mg=="g" ? TMKfmt_fmt_act2grade(x) : x ;
}
mrk2g2 = function (x, mg) {
    return mg == 2 || mg=="g" ? TMKfmt_fmt_act2grade(x) : Number(x).toFixed(2) +StarFlag(Number(x)) ;
}
fmt_course_term = function (m, j,mg) {
    var td = "<td class=mk1>";
    var res = "";
    res += "<tr><td class=mk0>" + m["cn"] + (m["rate"]==100 ? "":m["rate"]+"%") + "</td>";
    res += td + mrk2g( m["t" + j],mg) + "</td>" +
        td + mrk2g(m["e" + j], mg) + "</td>" +
        "<td class=mke>" + mrk2g2(m["to" + j],mg) + "</td>"; 
    return res;
};
fmt_subcourse_term = function (m, j,mg) {
    var res = "";
    res += "<tr><td>" + m["cn"]+ (m["rate"]==100 ? "":m["rate"]+"%")
    var td = "<td class=mk1>";
    res += td + mrk2g(m["t" + j], mg) + td + mrk2g( m["e" + j],mg) + "<td class=mke>";
    return res;
};
endofcult = function (r, j,mg) {
    var res = "<tr class=mkT><td class=mk0 align=right>學科總平均成績";
    res += "<td></td><td></td><td class=mke>" + mrk2g2( r["voc" + j],mg);
    return res;
};
endofprof = function (r, j,mg) {
    var res = "<tr class=mkT><td class=mk0 align=right>學科總平均成績";
    res += "<td></td><td></td><td class=mke>" + mrk2g2(r["vop" + j],mg);
    return res;
};
endofcourse = function (r, j,mg) {
    var res = "<tr class=mkT><td class=mkT>總平均成績";
    res += "<td class=mkT>&nbsp;</td><td class=mkT>&nbsp;</td><td class=mkTE>" + mrk2g2( r["mk" + j],mg); //.toFixed(2);
    return res; //.replace(/<td>/g, "<td class=mkT>");
};
function docprtterm( term, mg, totals, marks)
{
    var res = "";
    var ctype = null;
    var techcourse = false;
    for (var j = 0; j < marks.length-1; j++) {
        if (ctype == null) {
            ctype = marks[j]["ct"];
            res += "<tr>" + cttypedisc(ctype);
        }
        if (ctype != marks[j]["ct"]) {
            if (ctype == "職業文化") {
                res += endofcult(totals, term, mg);
                techcourse = true;
            }
            ctype = marks[j]["ct"];
            res += "<tr>" + cttypedisc(ctype);
        }
        if (j == (marks.length - 2)
            || marks[j]["gid"] == 100
            || marks[j]["gid"] != marks[j + 1]["gid"]) {
            res += fmt_course_term(marks[j], term, mg);
        }
        else {
            res += fmt_subcourse_term(marks[j], term, mg);
        }
    }
    if (techcourse) {
        res += endofprof(totals, term, mg);
    }
    else {
        res += endofcourse(totals, term, mg);
    }
    document.write(res);
}
