# st4ck-api

[![Greenkeeper badge](https://badges.greenkeeper.io/christophehurpeau/st4ck-api.svg)](https://greenkeeper.io/)

A stack to build a json api app with all basic stuff needed:

- **technically**: koa + extended ko router + controller + services + model (based on mongoose)
- **features**:
  - users accounts (with email and password, can be easily extends with other properties)
  - authentification (email + password, with jwt tokens)
  - acl (by profile => group => rights)
  - easy to add router / controller / service / model (cli code generator)
  - api response middleware that makes consistent output
  - api client generated to use in external apps
  - logger and debug
  - environments ready (dev/testing/prod, with watcher/autoreload in dev, pm2 for prod)

The aim is not to automate the most stupid part of the job and focus on business value. So it's far to be technically perfect, but keep it simple to work or to code custom stuff.

_it is a work in progress, mostly a boilerplate for quick dev for now._

## Install

```
git clone
npm install
```

## Test

Start the app (mongoose + npm run start or npm run watch or full deployment), then

```
npm run test
```

These tests are "end-to-end", using the client input and output.

## Cli tools

You can then use cli tools via npm:

- ```npm run setup```: .env interactive file generator
- ```npm run build```: transpiles sources with babel
- ```npm run start```: start local server from transpiled sources
- ```npm run watch```: start local server from sources with babel-cli and relaod on change (no need to build)
- ```npm run generator```: start interactive generator of template piece of code
- ```npm run seed```: seed the current env database from dev/detabase-seeding/{env} collection
- ```npm run clean```: remove all transpiled data
- ```npm run test```: run end-to-end tests (from /test/tests)
- ```npm run db```: to quickly start a local mongod with .env port config
- ```npm run lint```: lint/fix and report

## Production

### With simple node

To run in production, first build the sources and start node:

```
npm run build
node dist/app/index.js
```

_Do not forgot to set the environment vars required by the app_

### With PM2

I use pm2 to run the app in production. Here the small things to do to run with pm2.

Copy/paste/custom ```process-example.json``` in ```process.json```, custom it, then

```
npm install -g pm2
pm2 start process.json
```

The envrinoment vars will be the ones in your ```process.json``` or the real environement vars ( and no more var set from ```.env``` file). You can get mode information about pm2 [here](http://pm2.keymetrics.io/) to run in cluster, tail log and so on.

## Notes

Transpilation is done with ```babel-preset-es2015``` and not ```babel-preset-es2015-node``` because of [the async/super bug](https://github.com/babel/babel/pull/3423)
