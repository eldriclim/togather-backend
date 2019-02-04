const _ = require('lodash');

var { User } = require('./../models/user');

const express = require('express');
const router = express.Router();

var { authenticate } = require('./../middleware/authenticate');

// Create User - POST /users
router.post('/', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
router.delete('/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

// Read user - GET /users/me
router.get('/me', authenticate, (req, res) => {
  var me = req.user;
  var events = req.user.events;
  
  
  res.send({
    _id: me._id,
    email: me.email,
    firstName: me.firstName,
    lastName: me.lastName,
    events
  });
});

// Read user - GET /users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    var user = await User.findById(req.params.id);
    res.status(200).send(user)
  } catch (e) {
    res.status(403).send(e.message)
  }

});

module.exports = router;