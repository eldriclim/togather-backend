const mongoose = require('mongoose');
const _ = require('lodash');
const { User } = require('./user');
var uniqueValidator = require('mongoose-unique-validator');
const { ObjectID } = require('mongodb');

var EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  time: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  coin: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }],
  key: {
    type: String,
    required: true,
    unique: true
  }
});

EventSchema.plugin(uniqueValidator);

EventSchema.methods.addMember = async function (userID) {
  var event = this;

  try {
    var memberExist = event.members.some((member) => {
      return member.equals(userID);
    });

    if (memberExist) {
      throw new Error('User already in Event');
    }

    event.members = event.members.concat(userID);
    await event.save()

    var user = await User.findById(userID);
    user.events = user.events.concat(event._id);
    await user.save();

  } catch (e) {
    throw new Error(e);
  }

}

EventSchema.methods.leave = async function (userID) {
  var event = this;

  try {
    var memberExist = event.members.some((member) => {
      return member.equals(userID);
    });

    if (!memberExist) {
      throw new Error('User is not an Event member');
    }

    event.members = event.members.filter((member) => !member.equals(userID));
    await event.save()

    var user = await User.findById(userID);
    user.events = user.events.filter((event) => !event.equals(event._id));
    await user.save();

    if (event.members.length == 0) {
      await Event.deleteOne({ _id: event._id });
    }

  } catch (e) {
    throw new Error(e);
  }

}

EventSchema.statics.findByRoomKey = function (key) {
  return Event.findOne({ key });
};

EventSchema.statics.findByMember = function (userID) {
  return Event.find({ members: userID });
};

EventSchema.statics.createEvent = async function (body, userID) {
  try {
    var event = new Event(body);
    var eventObject = await event.save();
    var userObject = await User.findById(userID);

    userObject.events = userObject.events.concat(eventObject._id);

    await userObject.save();

    return eventObject;
  } catch (e) {
    throw new Error(e);
  }
};


var Event = mongoose.model('Event', EventSchema);

module.exports = { Event };