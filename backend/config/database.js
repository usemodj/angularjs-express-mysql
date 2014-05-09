var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'localhost',
	port : 3306,
	user : 'root',
	password : 'root',
	database : 'express_mysql_mvc_dev'
});

connection.connect(function(err) {
	if (err) {
		console.error('mysql connection error');
		console.error(err);
		throw err;
	}
});

module.exports = connection;
