const environment = require('../dist/app/config/server').environment;
const usersSeeds = require(`../dev/database-seeding/${environment}/users`);

var users = {
  admin : null,
  validated: null,
  notvalidated : null,
};

usersSeeds.forEach((user) => {
  if (user.profile && user.profile === 'admin') {
    users.admin = user;
  } else if (user.validated_at) {
    users.validated = user;
  } else {
    users.notvalidated = user;
  }
});

Object.keys(users).forEach((type) => {
  if (users[type] === null) {
    throw new Error('Seeding is not complete')
  }
});

module.exports = users;
