global.fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const inquirer = require('inquirer');
const ejs = require('ejs');
const relativeRoot = '../../';
const config = require(`${relativeRoot}src/app/config/server`)
const parameters = require(`${relativeRoot}src/app/config/parameters`)

function getModelsNames() {
  return fs.readdirSync(path.resolve(__dirname, relativeRoot, 'src/app', parameters.paths.models)).map(k => k.replace('.js', ''));
}

function getControllerNames() {
  return fs.readdirSync(path.resolve(__dirname, relativeRoot, 'src/app', parameters.paths.controllers)).map(k => k.replace('.js', ''));
}

function getTemplate(tpl) {
  const filepath = path.resolve(__dirname, './templates', `${tpl}.ejs`);
  return fs.readFileSync(filepath, {encoding: 'utf8'})
}

function outputTemplate(template, data, folder, filename) {
  return new Promise((resolve, reject) => {
    const tpl = getTemplate(template)
    const content = ejs.render(tpl, data);
    const fileToSaveTo = path.resolve(__dirname, relativeRoot, 'src/app', folder, filename);
    try {
      fs.accessSync(fileToSaveTo, fs.F_OK);
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `The file "${fileToSaveTo}" already exists. Overwrite?`,
      }).then((answers) => {
        if (answers.confirm) {
          return resolve(saveInFile(fileToSaveTo, content));
        } else {
          console.log('skipped');
          return false;
        }
      });
    } catch (e) {
      return resolve(saveInFile(fileToSaveTo, content));
    }
  })
}

function saveInFile(fileToSaveTo, content, options = { encoding: 'utf8' }) {
  try {
    fs.writeFileSync(fileToSaveTo, content, options);
    console.log(`File "${fileToSaveTo}" saved!`);
    return true;
  } catch(err) {
    console.log('ERROR WHILE SAVING FILE')
    console.log(err);
    return false;
  }
}

console.log("        +   /\                            .    ");
console.log("          .'  '.   *             +             ");
console.log("         /======\\      +                      ");
console.log("        ;:.  _   ;                             ");
console.log("  *     |:. (_)  |      Small                  ");
console.log("        |:.  _   |        Code                 ");
console.log("        |:. (_)  |          Generator        + ");
console.log("        ;:.      ;                             ");
console.log("      .' \:.    / `.                           ");
console.log("     / .-'':._.'`-. \\       .                 ");
console.log("     |/    /||\\    \\|                .       ");
console.log('____..--"""````"""--..______.~_____________.~¨.');
console.log('');

inquirer.prompt({
  type: 'list',
  name: 'generator',
  message: 'What do you want to generate?',
  choices: [
    { name: 'a database model', value: 'model', short: 'a model'},
    { name: 'a service based on an existing model', value: 'service', short: 'a service'},
    { name: 'a controller (bound or not to a model)', value: 'controller', short: 'a controller'},
    { name: 'a router', value: 'router', short: 'a router'},
    { name: 'a full model-service-controller-router', value: 'full-model', short: 'a full set'},
    new inquirer.Separator(),
    { name: 'the api client', value: 'api', short: 'the api client'},
  ]
}).then((typeAnswers) => {
  switch(typeAnswers.generator) {
    // =========================================================================
    case 'full-model': {
      let data = {};
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What the name of the object? (plural form)',
        validate: (res) => res.match(/^\w/i) ? true : 'Must be a lowacase alpha string',
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        return data;
      }).then(() => {
        data.example = true;
        data.model = data.name;
        data.controller = data.name;
        data.ressource = data.name;
        return outputTemplate('model', data, parameters.paths.models, data.name + '.js');
      }).then(() => {
        return outputTemplate('service', data, parameters.paths.services, data.name + '.js');
      }).then(() => {
        return outputTemplate('controller-service', data, parameters.paths.controllers, data.name + '.js');
      }).then(() => {
        return outputTemplate('router', data, parameters.paths.routers, data.ressource + '.js');
      }).then(() => {
        console.log('Done!');
        console.log(`Edit the controller file ${data.name}.js to enable the routes you need!`);
      });
      break;
    }

    // =========================================================================
    case 'model': {
      let data = {};
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What the name of the model?',
        validate: (res) => res.match(/^\w/i) ? true : 'Must be a lowacase alpha string',
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        return inquirer.prompt({
          type: 'list',
          name: 'example',
          message: 'Do you want code sample (in comment)?',
          choices: [
            { name: 'Yes', value: true, short: 'with examples' },
            { name: 'No', value: false, short: 'without examples' },
          ],
        });
      }).then((answers) => {
        data.example = answers.example;
        outputTemplate('model', data, parameters.paths.models, data.name + '.js');
      })
      break;
    }

    // =========================================================================
    case 'service': {
      let data = {};
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What the name of your service?',
        validate: (res) => res.match(/^\w/i) ? true : 'Must be a lowacase alpha string',
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        inquirer.prompt({
          type: 'list',
          name: 'model',
          message: 'Model to use in the service?',
          choices: getModelsNames(),
        }).then((answers) => {
          data.model = answers.model;
          outputTemplate('service', data, parameters.paths.services, data.name + '.js');
        })
      })
      break;
    }

    // =========================================================================
    case 'controller': {
      let data = {};
      let template= 'controller';
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What the name of the controller?',
        validate: (res) => res.match(/^\w/i) ? true : 'Must be a lowacase alpha string',
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        return data;
      }).then(() => {
        return inquirer.prompt({
          type: 'list',
          name: 'type',
          message: 'What kind of controller to generate?',
          choices: [
            { name: 'A basic controller', value: '', short: 'basic' },
            { name: 'A controller bound to a model', value: 'model', short: 'model bound' }
          ]
        });
      }).then((answers) => {
        if (answers.type === 'model') {
          template= 'controller-model';
          return inquirer.prompt({
            type: 'list',
            name: 'model',
            message: 'Which model to bind to?',
            choices: getModelsNames()
          }).then((answers) => {
            data.model = answers.model;
          })
        } else {
          return null;
        }
      }).then(() => {
        outputTemplate(template, data, parameters.paths.controllers, data.name + '.js');
      });
      break;
    }

    // =========================================================================
    case 'router': {
      let data = {};
      inquirer.prompt({
        type: 'text',
        name: 'ressource',
        message: 'What ressource will the router deal with?',
      }).then((answers) => {
        data.ressource = answers.ressource;
        data.kRessource = data.ressource.substr(0, 1).toUpperCase() + data.ressource.substr(1, 1000);
        inquirer.prompt({
          type: 'list',
          name: 'controller',
          message: 'Which controller to bind to?',
          choices: getControllerNames()
        }).then((answers) => {
          data.controller = answers.controller;
          outputTemplate('router', data, parameters.paths.routers, data.ressource + '.js');
        })
      });
      break;
    }

    // =========================================================================
    case 'api': {
      const ui = new inquirer.ui.BottomBar();
      ui.updateBottomBar('fetching api documentation');

      const docUrls = config.urls.root + config.urls.root_path + '/documentation/methods';
      fetch(docUrls, {
        mode: 'cors',
        cache: 'default',
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).catch((err) => console.log(err))
        .then((res) => {
          return res.json();
        })
        .then((json) => {
          const routerConfig = json.success.dataset;
          const methodTemplate = getTemplate('api/method');
          let methods = [];
          let k = 1;
          json.success.dataset.forEach((cfg) => {
            ui.updateBottomBar(`${k}/${json.success.dataset.length} ` + cfg.name);
            k++;
            if (cfg.args) {
              let data = {
                methodName: cfg.name,
                methodArgs: [],
                options: [],
                method: cfg.method || 'get',
                description: cfg.description || '@todo: add description',
                results: cfg.results,
              };

              const args = cfg.args;
              const results = cfg.results;

              let methodPath = cfg.path;
              if (args.params) {
                args.params.forEach((param) => {
                  data.options.push(param);
                  methodPath = methodPath.replace(`:${param}`, '${' + param + '}');
                  data.description += "\n" + `   * @param ${param}`;
                });
                methodPath = '`' + methodPath + '`';
              } else {
                methodPath = '\'' + methodPath + '\'';
              }

              data.methodArgs.push(methodPath);

              if (args.get) {
                data.options.push('options = {}');
                data.methodArgs.push('options');
                data.description += "\n" + `   * @param options filter items to ${data.method}`;
              } else {
                if (args.data) {
                  data.methodArgs.push('{}');
                }
              }
              if (args.data) {
                data.options.push('data = {}');
                data.methodArgs.push('data');
                data.description += "\n" + `   * @param data new data to ${data.method}`;
              }
              methods.push(ejs.render(methodTemplate, data));
            }
          });
          ui.updateBottomBar('');
          inquirer.prompt({
            type: 'text',
            name: 'name',
            default: 'base',
            message: 'Name of the file?',
          }).then((answers) => {
            outputTemplate('api/main', { methods: methods.join('') }, '../client', answers.name + '.js');
          });
        })
        .catch(err => console.log(err));
      break;
    }

    default:
      console.log('Bye bye!')
  }
});
