require('./config/config');
require('./db/mongoose.js');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const socketIO = require('socket.io');

var { User } = require('./models/user');
var { Event } = require('./models/event');


var app = express();
var userRoute = require('./routes/user.route');
var eventRoute = require('./routes/event.route');
var server = http.createServer(app);
var io = socketIO(server);
const port = process.env.PORT;
var date = moment();

app.use(bodyParser.json());

app.use(express.static('./public'));

io.on('connection', (socket) => {
  let token;

  socket.on('auth', async (data, callback) => {
    try {
      const user = await User.findByToken(data.token);

      if (!user) {
        return callback('Authentication failed')
      }

      token = data.token;

      const event = await Event.findByRoomKey(data.room);

      if (!event) {
        return callback('No such room.')
      }

      if (moment(event.time).format('YYYYMMDD') < date.format('YYYYMMDD')) {
        console.log('Event already over');

        return callback('Event already over')
      }
      
      if(!event.members.some((member) => member.equals(user._id))){
        return callback('User not in event.');
      }
      
      socket.join(data.room);
      var count = io.sockets.adapter.rooms[data.room].length
      console.log(`${count}/${event.members.length} online.`);
      
      io.to(data.room).emit('testPrint', `${count}/${event.members.length} online.`)
      

    } catch (e) {
      callback(e);
    }
  });

});

app.use('/users', userRoute);

app.use('/events', eventRoute);

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app }