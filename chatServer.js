var sio 		= require('socket.io')
  , htmlencode	= require('htmlencode').htmlEncode
  , emoticons 	= require('emoticons')
  , buffer		= require('buffer').Buffer
  , dbHelper = require('./dbHelper')
  , iconsJson 	= require(__dirname + '/node_modules/emoticons/support/skype/emoticons.json');

exports.start = start;

function start (httpServer) {
	return new ChatServer(httpServer);
	console.info('Chat server started');
}

function ChatServer (httpServer) {
	var self = this;
	this.MAX_CHAT_MESSAGES 	= 30;

	dbHelper.connect('mongodb://127.0.0.1/pinoyrealtv', { auto_reconnect: true });
	dbHelper.on('connection', onConnection);

	function onConnection () {
		//initialize socket server
		self.io = sio.listen(httpServer);

		//initialize emoticons
		emoticons.define(iconsJson);

		//initialize settings
		self.io.set('log level', 2);
		self.io.set('transports', [ 'websocket', 'xhr-polling' ]);

		//configure authorization
		self.io.configure(configure);

		//listen to connections
		self.io.sockets.on('connection', self.onConnection.bind(self));
	}

	function configure () {
		self.io.set('authorization', function (handshakeData, callback) {
			var validUser = getUserData(handshakeData.query.userData);
			//check if the handshake has a username
			if(validUser) {
				return callback(null, true);
			} else {
				return callback(null, false);
			}
		});
	}
}

ChatServer.prototype.onConnection = function (socket) {
	var self 		= this;
	var userData 	= getUserData(socket.handshake.query.userData);
	var room 		= '/' + userData.room;
	socket.set('userData', userData);

	//join the user into the room
	socket.join(room);

	//send all the messages
	getMessages(room, function (err, room) {
		if(room)
			socket.emit('msgs', room.messages);
	});

	//send the list of users online
	getUsers(room, function (err, users) {
		socket.emit('users', users);
	});
	
	//notify other users that new user has joined
	socket.broadcast.to(room).emit('joined', generateUserData(userData));

	socket.on('alive', function (userData) {
		socket.broadcast.to(room).emit('joined', userData);
	});

	socket.on('message', function (message) {
		message = htmlencode(message);
		message = emoticons.replace(message);
		socket.get('userData', function (error, userData) {
			if(error) return;
			var msgData = generateUserData(userData, message);
			saveMessage(room, msgData);
			self.io.sockets.in(room).emit('chat', msgData);
		});
	});

	socket.on('disconnect', function () {
		self.io.sockets.in(room).emit('left', generateUserData(userData));
	});

	function generateUserData (userData, message) {
		var data = {
			username: userData.user_first,
			lastname: userData.user_last,
			fb		: userData.user_facebook,
		};

		if(message)
			data.message = message;

		return data;
	}

	function getUsers (room, cb) {
		var sockets = self.io.sockets.clients(room);
		var users 	= [];
		for(var i in sockets) {
			sockets[i].get('userData', function (error, userData) {
				if(error) return;
				var user = generateUserData(userData);
				users.push(user);
			});
		}
		return cb(null, users);
	}

	function saveMessage (room, msgData) {
		var rm = room.substr(1);
		dbHelper.saveMessage(rm, msgData);
	}

	function getMessages (room, cb) {
		var rm = room.substr(1);
		return dbHelper.getMessages(rm, cb);
		//return self.rooms[room];
	}
};

function getUserData (userData) {
	var valid = new Buffer(userData, 'base64').toString('utf8');
	try {
		valid = JSON.parse(valid);
		if(valid.hasOwnProperty('user_id') && valid.hasOwnProperty('room')) {
			return valid;
		}
	} catch(e) {}
	
	return false;
}