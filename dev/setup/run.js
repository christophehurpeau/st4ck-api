const inquirer = require('inquirer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

let data = {};
inquirer.prompt({
  type: 'list',
  name: 'NODE_ENV',
  message: 'Node environement',
  choices: [
    { name: 'Production', value: 'production', short: 'production' },
    { name: 'Testing', value: 'test', short: 'test' },
    { name: 'Development', value: 'development', short: 'development' },
  ],
  default: 'development'
}).then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'WEB_PORT',
    message: 'Web port',
    default: 3000,
    validate: (v) => /^\d+/.test(v) && v > 0 && v < 65556
  });
}).then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'WEB_URL',
    message: 'Web url',
    default: 'http://localhost:3000',
  });
}).then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'LOG_PATH',
    message: 'Path to store logs',
    default: '/tmp',
  });
}).then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'DATABASES_MAIN',
    message: 'Main mongo database',
    default: 'mongodb://localhost:27299/myapp-dev',
  });
}).then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'TOKEN_SECRET',
    message: 'Secret token',
    default: 'supercalifragilisticexpialidocious',
  });
}).then((answers) => {
  Object.assign(data, answers);

  const filepath = path.resolve(__dirname, '../..', `.env-example`);
  const distpath = path.resolve(__dirname, '../..', `.env`);

  const template = fs.readFileSync(filepath, { encoding: 'utf8' });
  const content = ejs.render(template, data);
  fs.writeFileSync(distpath, content, { encoding: 'utf8' });
  console.log('.env file saved !');
});
