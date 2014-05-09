module.exports = function(app) {

	app.get('/users', function(req, res, next) {
		req.models.users.find().all(function(err, users) {
			if (err)
				return next(err);
			console.log('>>routes/users:');
			console.log(users);
			res.json(users);
		});
	});
	
//	 app.get('/users', function(req, res) {
//		req.db.driver.execQuery('SELECT * FROM users', function(err, users) {
//			console.log(users);
//			res.json(users);
//		});
//	});
	
	// '/users/:id?color=red' -> req.params.id, req.query.color
	app.get('/users/:id', function(req, res, next){
		req.models.users.get(req.params.id, function(err, user){
			if(err) return next(err);
			console.log('>>routes/users/'+ req.params.id);
			console.log(user);
			res.json(user);
		});
	});
};
