function getConnection() {
	var pool = mysql.createPool({
		connectionLimit: 100,  //decided by DB-server-limit/client-number
		acquireTimeout: 10000,
		host: config.mysql.host,
		port: config.mysql.port,
		user: config.mysql.user,
		password: config.mysql.password,
		database: config.mysql.database,
		dateStrings: true
	});
	pool.on('connection', function(conn) {
		console.log('mysql::::pool connection event fired');
	});
	pool.on('enqueue', function() {
		console.log('mysql::::Waiting for available connection slot');
	});
	return pool;
}

var pool = getConnection();

function execSqlAsync(sql, condition) {
  return new Promise(function(fulfill, reject) {
    pool.getConnection(function(err, connection) {
			if (err) {
				connection && connection.release();
				reject(err);
				return;
			}
			var query = "";
			if (condition != undefined)
				query = connection.query(sql, condition, function(err, result) {
					connection.release();
					if (err) {reject(err);return;}
					fulfill(result);
				});
			else
				query = connection.query(sql, function(err, result) {
					connection.release();
					if (err) {reject(err);return;}
					fulfill(result);
				});
			console.log("======sql:" + query.sql);
		});
	});
}

module.exports = {
	mysqlConnPool: pool,
	execSqlAsync: execSqlAsync
};
