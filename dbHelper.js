var util 			= require('util')
  , EventEmitter 	= require('events').EventEmitter
  , MongoClient 	= require('mongodb').MongoClient;

util.inherits(MongoHelper, EventEmitter);
module.exports = new MongoHelper();

function MongoHelper () {
	EventEmitter.call(this);
}

MongoHelper.prototype.connect = function(url, options, callback) {
	var self = this;
	if(!callback) {
		callback = function (err, db) {
			if(err)
				throw err;

			self.collection = db.collection('rooms');
			console.info('Mongo connection started');
			return self.emit('connection', null);
		};
	}

	MongoClient.connect(url, options, callback);
};

MongoHelper.prototype.saveMessage = function (room, msgData) {
	var self = this;
	var msgs = {
		messages: msgData
	};
	msgData.created = new Date();
	self.collection.update({_id: room}, {$push: msgs}, {upsert: true}, function(err, docs) {
		if(err)
			throw err;
	});
};

MongoHelper.prototype.getMessages = function (room, cb) {
	return this.collection.findOne({ _id: room }, {'messages': {$slice: -30}}, function(err, results) {
		cb(err, results);
	});
};