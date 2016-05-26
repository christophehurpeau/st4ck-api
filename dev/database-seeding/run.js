const fs = require('fs');
const path = require('path');

const environment = require('../../dist/app/config/server').environment;
const seedFolder = path.resolve(__dirname, environment);

const modelFactory = require('../../dist/core/factory/model');

function seed() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(seedFolder) || !fs.statSync(seedFolder).isDirectory()) {
      console.log(`No seeding for "${environment}" environment`);
      return reject(`Error while dropping collect: ${err.message || err}`);
    }

    let promises = { insert: [], drop: [] };

    fs.readdirSync(seedFolder).forEach((file) => {
      const seedFile = `${seedFolder}/${file}`;
      if (fs.statSync(seedFile).isFile()) {
        const datas = require(seedFile);
        const modelSlug = file.replace('.json', '');
        console.log(` > Seeding "${modelSlug}"`);

        const model = modelFactory(modelSlug);
        promises.drop.push(model.remove());
        datas.forEach((data) => {
          promises.insert.push(model(data).save());
        });
      }
    });

    return Promise.all(promises.drop)
      .catch((err) => {
        return reject(`Error while dropping collection: ${err.message || err}`);
      })
      .then((res) => {
        return Promise.all(promises.insert);
      })
      .catch((err) => {
        return reject(`Error while inserting document: ${err.message || err}`);
      })
      .then((res) => {
        console.log('Seeding finish!');
        return resolve(true);
      });
  });
}

module.exports = seed;
if (!module.parent) {
  seed().then((res) => {
    process.exit(0);
  }).catch((err) => {
    console.log(`Seeding error: ${err.message || err}`, err);
    process.exit(0);
  });
}
