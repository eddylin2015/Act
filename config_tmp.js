// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');
nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'DATA_BACKEND',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'INSTANCE_CONNECTION_NAME',
    'NODE_ENV',
    'PORT',
    'SECRET'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    DATA_BACKEND:'',
    INSTANCE_CONNECTION_NAME:'',
    MYSQL_USER: '',
    MYSQL_PASSWORD: '',
    PORT: 8000,
    SECRET: 'key',
    MYSQL_INFO_host: '127.0.0.1',
    MYSQL_INFO_user: 'user',
    MYSQL_INFO_password: '123',
    MYSQL_INFO_db:'db',
    MYSQL_250_host: '127.0.0.1',
    MYSQL_250_user: 'user',
    MYSQL_250_password: '123',
    MYSQL_NEWS_host: '127.0.0.1',
    MYSQL_NEWS_user: 'user',
    MYSQL_NEWS_password: '123',
    MYSQL_NEWS_db:'db',

    API_SP_TOKEN:"key"
  });
// Check for required settings
if (nconf.get('DATA_BACKEND') === 'cloudsql') {
  checkConfig('MYSQL_USER');
  checkConfig('MYSQL_PASSWORD');
  if (nconf.get('NODE_ENV') === 'production') {
    checkConfig('INSTANCE_CONNECTION_NAME');
  }
} else if (nconf.get('DATA_BACKEND') === 'mongodb') {
}

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
