'use strict';

var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var passport = require('passport');
const session = require('express-session')
var RedisStore = require('connect-redis')(session);
const config = require('./config');
var CntReqs = 0;
var CntClusterReqs = "";
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true, parameterLimit:50000 }));//default false
app.use(session({
  store: new RedisStore({ host: "127.0.0.1" }),
  secret: "keyboard",
  resave: false,
  saveUninitialized: false
}));
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./db/internalOauth2').router);
//setup session store
app.get('/', function (req, res) {
  process.send({ cmd: 'notifyRequest', num: 0, pid: process.pid });
  return res.redirect('/internal/');
});
const users = require('./db/internal_users_redis');

app.get('/pidu', function (req, res) {
  let staf = (req.query.staf)? req.query.staf:'2002024';
  process.send({ cmd: "notifyUpdateUsers", stafref: staf });
  res.end(`IPC process.send ( notifyUpdateUsers , ${staf} );`);
});

app.get('/req', function (req, res) {
  process.send({ cmd: 'notifyRequest', num: 0, pid: process.pid });
  res.end(`${CntClusterReqs}  , ${process.pid} count request ${CntReqs} !`);
});

app.get('/reqcnt', function (req, res) { res.end(`${CntClusterReqs}  , ${process.pid} count request ${CntReqs} !`);});

app.use(routes);

app.use('/news',require('./routes/news/crud'));
app.use('/internal/activitycourses',require('./routes/activitycourses/crud'));
app.use('/internal/activitycourses_admin',require('./routes/activitycourses_admin/crud'));

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    //res.status(err.status || 500);
    res.render('error', {
      profile: req.user,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  //res.status(err.status || 500);
  res.render('error', {
    profile: req.user,
    message: err.message,
    error: err
  });
});
app.set('port', config.get("PORT"));
const cluster = require('cluster');
const numCPUs = require('os').cpus().length>6?2:require('os').cpus().length;

if (cluster.isMaster) {
  let numReqs = 0;
  let numPidReqs = {}
  function eachWorker(callback) {
    for (const id in cluster.workers) {
      callback(cluster.workers[id]);
    }
  }
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1; let key = "pid" + msg.pid;
      numPidReqs[key] = numPidReqs.hasOwnProperty(key) ? (numPidReqs[key] + 1) : 1;
      eachWorker((worker) => { worker.send({ cmd: 'workNumReqs', num: numReqs, pid: msg.pid, nums: JSON.stringify(numPidReqs) }); });
    } else if (msg.cmd && msg.cmd === 'notifyUpdateUsers') {
      eachWorker((worker) => { worker.send({ cmd: 'workUpdateUsers', staf: msg.stafref }); });
    }
  }
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs - 1; i++) { cluster.fork(); }
  cluster.on('exit', (worker, code, signal) => {
    console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code);
    cluster.fork();
  });
  for (const id in cluster.workers) { cluster.workers[id].on('message', messageHandler); }
} else {
  var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
  });
  console.log(`Worker ${process.pid} started`);
  process.on('message', (msg) => {
    if (msg && msg.cmd == "workNumReqs") {
      CntReqs = msg.num;
      CntClusterReqs = msg.nums;
    } else if (msg && msg.cmd == "workUpdateUsers") {
      console.log(cluster.worker.id, JSON.stringify(msg));
      users.updateUser(msg.staf, (result) => {
        console.log(JSON.stringify({ pid: process.pid, staf: msg.staf, res: result }));
      });
    }
  });
}
