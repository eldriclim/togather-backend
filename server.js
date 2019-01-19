require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose.js');
var { User } = require('./models/user');

var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`Hello world ${port}`);
});

// Create User - POST /users
app.post('/users', async (req, res) => {
  const body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName']);
  const user = new User(body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Create token - POST /users/login
app.post('/users/login', async (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken()

    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

// Delete token - DELETE /users/me/token
app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

// Read user - GET /users/me
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app }