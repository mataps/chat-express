exports.index = function(req, res) {
	var MongoClient = require('mongodb').MongoClient
		, ObjectID 	= require('mongodb').ObjectID
		, format 	= require('util').format;

	MongoClient.connect('mongodb://127.0.0.1/pinoyrealtv', function(err, db) {
		if(err) {
			console.error('Failed to connect to the database');
			return false;
		}

		// // string to hex
		// var title 	= new Buffer('UGlub3kgSW5kaWVz', 'base64').toString('hex');
		// //hex to string
		// var hex = new ObjectID(title).toHexString();
		// //hex to base64
		// var base64 = new Buffer(hex, 'hex').toString('base64');
		// console.log(base64);

		var collection = db.collection('rooms');
		var msgData = {
			username: 'Ryan',
			lastname: 'Navarroza',
			fb		: 'myfb',
			fb_id	: '12345'
		};

		var msgs = {
			messages: msgData
		};
		var room = 'TElWRSwgTE9WRSwgTEFVR0ggd2l0aCBBVkVM';
		collection.update({_id: room}, {$push: msgs}, {upsert: true}, function(err, docs) {
			console.log(err);
			// Locate all the entries using find
			collection.find().toArray(function(err, results) {
				console.dir(results);
			});
		});
		// collection.insert({_id: 'UGlub3kgSW5kaWVz', a: 2}, function(err, docs) {
		// 	collection.count(function(err, count) {
		// 		console.log(format("count = %s", count));
		// 	});

		// 	// Locate all the entries using find
		// 	collection.find().toArray(function(err, results) {
		// 		console.dir(results);
		// 		// Let's close the db
		// 		db.close();
		// 	});
		// });
	});
	res.send("respond with a resource");
};