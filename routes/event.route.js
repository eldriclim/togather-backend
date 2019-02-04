const _ = require('lodash');

var { Event } = require('./../models/event');
const randomstring = require('randomstring');

const express = require('express');
const router = express.Router();

var { authenticate } = require('./../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {

  try {
    var events = await Event.findByMember(req.user._id);
    events = events.map((event) => event.toObject());

    res.status(200).send(events);
  } catch (e) {
    res.status(403).send(e);
  }
});

router.post('/join', authenticate, async (req, res) => {

  try {
    var event = await Event.findByRoomKey(req.body.room_key);
    
    if(!event){
      throw new Error('Invalid room key');
    }
    
    await event.addMember(req.user._id);

    res.status(200).send({
      event_id: event._id,
      room_key: event.key
    });

  } catch (e) {
    res.status(403).send(e.message);
  }

});

router.post('/leave', authenticate, async (req, res) => {

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

router.post('/', authenticate, async (req, res) => {
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
    res.status(400).send(e.message);
  }
});

module.exports = router;