# Togather

Togather is a mobile application that encourages social interaction between people during gatherings.

This repo serves as the backend for [Togather](https://github.com/cjianhui/togather/), powered by Express, Socket.io and MongoDB.

## Requirements

Node 8 or greater is required. You also need to install MongoDB locally.

## Running the project

Assuming you have all the requirements installed, you can setup and run the project by running:

- `mongodb.exe --dbpath [DB_ROOT]` to start up MongoDB server
- `npm install` to install the dependencies
- `npm server.js` to start up backend

## Libraries

Libraries used:

- [express](https://github.com/expressjs/express) as the backend framework
- [mongodb](https://github.com/mongodb/node-mongodb-native) as the MongoDB driver
- [mongoose](https://github.com/Automattic/mongoose) as ODM for MongoDB
- [socket.io](https://github.com/socketio/socket.io) to faciliate real-time interaction between client and server
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to generate token and allow stateless authentication
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) to salt and hash password
- [moment](https://www.npmjs.com/package/moment) an external DateTime library
- [body-parser](https://github.com/expressjs/body-parser) to parse body to JSON
- [lodash](https://www.npmjs.com/package/lodash) a utility library
- [randomstring](https://www.npmjs.com/package/randomstring) to generate random string for room code
- [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator) a plugin for pre-save uniqueness validation
- [validator](https://www.npmjs.com/package/validator) to library for string validators and sanitizers
- [mocha](https://github.com/mochajs/mocha) as the testing framework
- [supertest](https://github.com/visionmedia/supertest) for testing HTTP servers
- [expect](https://github.com/facebook/jest) for assertions in testing, refer to Jest

# Endpoints

## User collection

### POST /users

Create a user with incoming JSON data. New authentication token is created.

+ Request

    ```js
    {
      "email": "example@email.com",
      "password": "password123",
      "firstName": "Exam",
      "lastName": "Ple"
    }
    ```

+ Response
    + `x-auth` header

### POST /users/login

Logs in user. New authentication token is created.

+ Request

    ```js
    {
      "email": "example@email.com",
      "password": "password123",
    }
    ```

+ Response
    + `x-auth` header

### DELETE /users/me/token

End user session and delete authentication token. To include `x-auth` header.

### GET /users/me

Get current user details with user's list of events. To include `x-auth` header.

+ Response

    ```js
    {
      "_id": "507f191e810c19729de860ea",
      "email": "example@email.com", 
      "firstName": "Exam",
      "lastName": "Ple",
      "events": [
        "507f191e810c19760de86011"
      ]
    }
    ```

### GET /users/:id

Get user public details. To include `x-auth` header.

+ Parameter
    + `id` of user

+ Response

    ```js
    {
      "_id": "507f191e810c19729de860ea",
      "email": "example@email.com", 
      "firstName": "Exam",
      "lastName": "Ple"
    }
    ```

## Event collection

### POST /events

Create events with current user in member list and update user's event list. To include `x-auth` header.

+ Request

    ```js
    {
      "title": "My Event",
      "time": 1427238000000, 
      "latitude": 1.75938746593,
      "longitude": 3.57493748506,
      "duration": 7200000,
    }
    ```

+ Response

    ```js
    {
      "event_id": "507f191e810c19760de86011",
      "room_key": "EOAJV"
    }
    ```

### POST /events/join

Adds current user to event's member list and update user's event list. To include `x-auth` header.

+ Request

    ```js
    {
      "room_key": "EOAJV"
    }
    ```

+ Response

    ```js
    {
      "event_id": "507f191e810c19760de86011",
      "room_key": "EOAJV"
    }
    ```


### POST /events/leave

Removes current user from event's member list and update user's event list. To include `x-auth` header.

+ Request

    ```js
    {
      "room_key": "EOAJV"
    }
    ```

+ Response

    ```js
    {
      "event_id": "507f191e810c19760de86011",
      "room_key": "EOAJV"
    }
    ```

### GET /events

Retrieves events details of current user. To include `x-auth` header.

+ Response

    ```js
    [
        {
            "coin": 0,
            "status": false,
            "members": [
                "5c43e2907fb10e07b0eef1c2",
                ...
            ],
            "_id": "507f191e810c19760de86011",
            "title": "My Event",
            "time": "2015-03-24T09:30:48.585Z", 
            "latitude": 1.75938746593,
            "longitude": 3.57493748506,
            "duration": 7200000,
            "key": "EOAJV",
        },
        ...
    ]
    ```
