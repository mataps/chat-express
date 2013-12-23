
/**
 * Module dependencies.
 */

var express 	= require('express')
  , http 		= require('http')
  , path		= require('path')
  , chatServer 	= require('./chatServer.js');

/* routes */

var routes 	= require('./routes')
  , chat 	= require('./routes/chat')
  , mongo	= require('./routes/mongo');

var app = express();

// all environments
app.set('port', process.env.PORT || 8888);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('case sensitive routing', true);
app.set('env', 'production');

//middlewares
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/chat', chat.index);
app.get('/mongo', mongo.index);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

chatServer.start(server);