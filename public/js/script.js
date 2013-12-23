$(function () {
	var message;
	var username;
	var socket;
	var room;

	$('form.room').on('submit', function (e) {
		e.preventDefault();
		username = $('.login input').val().trim();
		room	 = $('.room input').val().trim();
		if(username) {
			connect(username, room);
		}
	});

	$('form.login').on('submit', function (e) {
		e.preventDefault();
		username = $('.login input').val().trim();
		room	 = $('.room input').val().trim();
		if(username) {
			connect(username, room);
		}
	});

	$('.chat-input textarea').bind('keypress', function(e) {
		if(!e.shiftKey && (e.keyCode || e.which) == 13) {
			e.preventDefault();
			$('.send-btn').trigger('click');
		}
    });

	$('.send-btn').on('click', function (e) {
		e.preventDefault();
		message = $('.chat-input textarea').val().trim();
		if(message) {
			socket.send(message);
			$('.chat-input textarea').val('');
		}
	});

	function connect(username, room) {
		var options 	= { query: 'username=' + username };
		socket 			= io.connect(null, options);

		socket.on('connect', function () {
			console.log(room);
			socket.emit('join', room);
		});

		socket.on('msgs', function(msgs) {
			for(var i in msgs) {
				displayMessage(msgs[i].username, msgs[i].message);
			}
		});

		socket.on('chat', function(chat) {
			displayMessage(chat.username, chat.message);
		});				

		socket.on('disconnect', function() {
			//$('#messages').append('<li>Disconnected</li>');
			// alert('about to disconnect');
		});
	}

	function displayMessage(username, message) {
		var messages = $('.chat-content');
		if(messages.children().length >= 30) {
			messages.children().first().remove();
		}
		messages.append('<p><strong>' + username + ': </strong><span>' + message + '</span></p>');
		//scroll the message box
		messages.scrollTop(messages[0].scrollHeight);
	}
});	