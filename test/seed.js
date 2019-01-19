/**
 * Seed data for test environment
 */
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { User } = require('./../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'eldric@email.com',
  password: 'password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }],
  firstName: 'Eldric',
  lastName: 'Lim'
}, {
  _id: userTwoId,
  email: 'emma@email.com',
  password: 'password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }],
  firstName: 'Emma',
  lastName: 'Ang'
}];


const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}

module.exports = { users, populateUsers };