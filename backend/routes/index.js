var express = require('express');
var router = express.Router();

module.exports = function(app){
	/* GET home page. */
	// app.get('/', function(req, res) {
	//   //res.render('index', { title: 'Express' });
	//   res.sendfile('../../frontend/app/index.html');
	// });

	app.get('/articles', function(req, res){
	  connection.query('SELECT * FROM article', function(err, articles){
	    console.log( articles);
	    res.json( articles);
	  });
	});
};

