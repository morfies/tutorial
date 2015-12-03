var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');

var sessMw = session({
	store: new RedisStore({
		client: new Redis(), //TODO your redis connection
		prefix: 'prefix_:'
	}),
	secret: 'dird titty',
	name: 'ss.sid',
	proxy: true,
	cookie: {
		maxAge: 30 * 60 * 1000 //ms.   30min no user interaction, then session expires
	},
	/*genid: function(req) {

	},*/
	rolling: true,
	resave: false, //TODO
	saveUninitialized: true, //TODO
	unset: false //TODO
});

exports = sessMw;
