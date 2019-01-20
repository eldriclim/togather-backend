require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const randomstring = require('randomstring');
const socketIO = require('socket.io');

var { mongoose } = require('./db/mongoose.js');
var { User } = require('./models/user');
var { Event } = require('./models/event');

var { authenticate } = require('./middleware/authenticate');

var app = express();
var io = socketIO(server);
const port = process.env.PORT;

app.use(bodyParser.json());

app.get('/events', authenticate, async (req, res) => {
  console.log(req);
  
  try{
    var events = await Event.findByMember(req.user._id);
    events = events.map((event) => event.toObject());
    
    res.status(200).send(events);
  }catch(e){
    res.status(403).send(e);
  }
});

app.post('/events/join', authenticate, async (req, res) => {

  try {
    var event = await Event.findByRoomKey(req.body.room_key);

    await event.addMember(req.user._id);

    res.status(200).send({
      event_id: event._id,
      room_key: event.key
    });

  } catch (e) {
    res.status(403).send(e.message);
  }

});

app.post('/events/leave', authenticate, async (req, res) => {

  try {
    var event = await Event.findByRoomKey(req.body.room_key);

    await event.leave(req.user._id);

    res.status(200).send({
      event_id: event._id,
      room_key: event.key
    });

  } catch (e) {
    res.status(403).send(e.message);
  }

});

app.post('/events', authenticate, async (req, res) => {
  var body = _.pick(req.body, ['title', 'time', 'latitude', 'longitude', 'duration']);
  body['members'] = [req.user._id];
  body['key'] = randomstring.generate({
    length: 5,
    charset: 'alphabetic',
    capitalization: 'uppercase'
  });

  try {
    var eventObject = await Event.createEvent(body, req.user._id);

    res.status(200).send({
      event_id: eventObject._id,
      room_key: eventObject.key
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
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

// Read user - GET /users/:id
app.get('/users/:id', authenticate, async (req, res) => {
try {  
  var user = await User.findById(req.params.id);
  res.status(200).send(user)
} catch (e) {
  res.status(403).send(e.message)
}

});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app }