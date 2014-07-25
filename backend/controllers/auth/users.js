async = require("async");
/*
 Person.count({ surname: "Doe" }, function (err, count) {
 console.log("We have %d Does in our db", count);
 });

 Person.find({ surname: "Doe" }, "name", function (err, people) {
 // finds people with surname='Doe' and returns sorted by name ascending
 });
 Person.find({ surname: "Doe" }, [ "name", "Z" ], function (err, people) {
 // finds people with surname='Doe' and returns sorted by name descending
 // ('Z' means DESC; 'A' means ASC - default)
 });

 Person.find({ surname: "Doe" }, { offset: 2 }, function (err, people) {
 // finds people with surname='Doe', skips the first 2 and returns the others
 });

 Person.find({ surname: "Doe" }).limit(3).offset(2).only("name", "surname").run(function (err, people) {
 // finds people with surname='Doe', skips first 2 and limits to 3 elements,
 // returning only 'name' and 'surname' properties
 Person.find({ age: 18 }).where("LOWER(surname) LIKE ?", ['dea%']).all( ... );

 Person.find({ age: 18 }).order('-name').all( ... );
 // see the 'Raw queries' section below for more details
 Person.find({ age: 18 }).orderRaw("?? DESC", ['age']).all( ... );

 Person.find({ surname: "Doe" }).each(function (person) {
 person.surname = "Dean";
 }).save(function (err) {
 // done!
 });

 Person.find({ surname: "Doe" }).each().filter(function (person) {
 return person.age >= 18;
 }).sort(function (person1, person2) {
 return person1.age < person2.age;
 }).get(function (people) {
 // get all people with at least 18 years, sorted by age
 });

 Conditions:
 { col1: 123, col2: "foo" } // `col1` = 123 AND `col2` = 'foo'
 { col1: [ 1, 3, 5 ] } // `col1` IN (1, 3, 5)

 { col1: orm.eq(123) } // `col1` = 123 (default)
 { col1: orm.ne(123) } // `col1` <> 123
 { col1: orm.gt(123) } // `col1` > 123
 { col1: orm.gte(123) } // `col1` >= 123
 { col1: orm.lt(123) } // `col1` < 123
 { col1: orm.lte(123) } // `col1` <= 123
 { col1: orm.between(123, 456) } // `col1` BETWEEN 123 AND 456
 { col1: orm.not_between(123, 456) } // `col1` NOT BETWEEN 123 AND 456
 { col1: orm.like(12 + "%") } // `col1` like '12%'

 req.db.tools:
 { between: [Function],
 not_between: [Function],
 like: [Function],
 eq: [Function],
 ne: [Function],
 gt: [Function],
 gte: [Function],
 lt: [Function],
 lte: [Function],
 not_in: [Function] },

 db.driver.execQuery("SELECT id, email FROM user", function (err, data) { ... })

 // You can escape identifiers and values.
 // For identifier substitution use: ??
 // For value substitution use: ?
 db.driver.execQuery(
 "SELECT user.??, user.?? FROM user WHERE user.?? LIKE ? AND user.?? > ?",
 ['id', 'name', 'name', 'john', 'id', 55],
 function (err, data) { ... }
 )

 // Identifiers don't need to be scaped most of the time
 db.driver.execQuery(
 "SELECT user.id, user.name FROM user WHERE user.name LIKE ? AND user.id > ?",
 ['john', 55],
 function (err, data) { ... }
 )

 For checking if a string is empty, null or undefined I use:

 function isEmpty(str) {
 return (!str || 0 === str.length);
 }
 For checking if a string is blank, null or undefined I use:

 function isBlank(str) {
 return (!str || /^\s*$/.test(str));
 }
 For checking if a string is blank or contains only white-space:

 String.prototype.isEmpty = function() {
 return (this.length === 0 || !this.trim());
 };
  */
module.exports = {

    //index: function(req, res) {
    // req.db.driver.execQuery('SELECT * FROM users', function(err, users) {
    // console.log(users);
    // res.json(users);
    // });
    // },

    //search users POST, GET
    index: function(req, res, next) {

        var Role = req.models.roles;
        var User = req.models.users;
        var perPages = 20;
        var page = parseInt(req.params['page']) || 1;
        if( isNaN(page) || page < 1) page = 1;
        console.log('>>req.body:'+ JSON.stringify(req.body));
        console.log('>> page:'+ page);

        var email = req.body.email || "";
        var role_id = req.body.role_id;
        var active = req.body.active;

        var conditions = {};
        if(email && email.length !== 0) {
            email = '%'+email+'%';
            conditions={email : req.db.tools.like(email)};
        }
        if(role_id !== undefined && role_id !== null) conditions.role_id = role_id;
        if(active !== undefined && active !== null) conditions.active = active;
        console.log('>>conditions:'+ JSON.stringify(conditions));
        console.log(conditions);
        User.find(conditions).order('-id').limit(perPages).offset((page -1)*perPages).run(function(err, users) {
            if (err) {
                console.log(">>error:"+ err);
                return next(err);
            }
            //console.log('>>users:'+ JSON.stringify(users));
            var listUsers = [];
            async.eachSeries(users, function(user, callback){
                Role.get(user.role_id, function(err, role){
                    user.role = role;
                    listUsers.push(user);
                    callback();
                });
            }, function(err){
                if(err) return next(err);
                User.count(conditions, function(err, count){
                    console.log('>> users.index count:'+ count);
                    res.json({
                        users: listUsers,
                        count: count,
                        page: page
                    })
                });

            });
        });
    },

    // get '/users/:id?color=red' --> req.params.id, req.query.color
    user: function(req, res, next) {
        req.models.users.get(req.params.id, {cache: false, autoFetchLimit: 2, autoFetch: true},function(err, user) {
            if (err) return next(err);
            req.models.roles.get(user.role_id, function(err, role){
                user.role = role;
                console.log('>>get /users/' + req.params.id);
                console.log(JSON.stringify(user));
                res.json(user);
            });
        });
    },

    // post signup
    createUser: function(req, res, next) {
        var User = req.models.users;
        var Role = req.models.roles;
        var email = req.body.email;
        var password = req.body.password;
        var retype_password = req.body.retype_password;

        Role.one({title: req.body.role.title}, function(err, role){
            //console.log('>>create user role:'+ JSON.stringify(role));

            User.create({
                email: email,
                encrypted_password: password,
                password_salt: '',
                current_sign_in_ip: req.ip,
                current_sign_in_at: new Date(),
                role_id: role.id
            }, function(err, user) {
                if (err) {
                    console.log('>> User.create err: ');
                    console.log(err);
                    return res.json(400, err);
                }
                // Password insert
                //var password_salt = user.makeSalt();
                //var encrypted_password = user.encryptPassword2(password, password_salt);
                user.password_salt = user.makeSalt();
                //var encrypted_password = user.encryptPassword(password);
                user.save({
                    password_salt: user.password_salt,
                    encrypted_password: user.encryptPassword(password)
                }, function(err) {
                    if (err) {
                        user.remove(function(err) {
                            console.log("removed!");
                        });
                        return res.json(400, err);
                    }
                    Role.get(user.role_id, function(err, role){
                        if(err) throw err;

                        user.role = role;
//                        req.logIn(user, function(err){
//                            if(err) return next(err);
//                            console.log('>>createUser user.serialize:'+ JSON.stringify(user.serialize()));
//                            res.json(200, user.serialize());
//                        });
                        res.json(200, user.serialize());
                    });

                });

            });
        });
    },

	//put Change Password
    changePassword: function(req, res, next) {
        if (!req.user) return res.json(400, 'Login is required.');
        var password = req.body.password;
        var new_password = req.body.new_password;
        var retype_password = req.body.retype_password;
        var email = req.body.email;

        console.log('>>changePassword req.body:'+JSON.stringify(req.body));
        req.models.users.findOne({
            email: email,
            password: password
        }, function(err, user) {
            if (err) {
                //console.log('>> users findOne err:');
                console.log(err);
                return res.json(400, err);
            }
            //console.log('>>/users put');
            //console.log(JSON.stringify(user));
            user.save({
                //email: email,
                encrypted_password: user.encryptPassword(new_password)
            }, function(err) {
                if (!err) {
                    console.log('Password is updated!');
                    return res.json(200, 'Password is updated!');
                } else {
                    console.log(err);
                    return res.json(400, err);
                }
            });
        });
    },
    // put '/users/:id?color=red' --> req.params.id, req.query.color
    changeRole: function(req, res, next){
        var roleId = req.body.role_id;
        var active = req.body.active;
        var id = req.params.id;
        console.log('>> changeRole req.body:'+ JSON.stringify(req.body));
        req.models.users.get(id, function(err, user){
            req.models.roles.get(roleId, function(err, role){
                user.role = role;
                user.role_id = roleId;
                user.active = active;
                user.save(function(err) {
                    if (!err) {
                        console.log('Role is updated!');
                        console.log('>>changeRole user:'+ JSON.stringify(user));
                        return res.json(200, 'Role is updated!');
                    } else {
                        console.log(err);
                        return res.json(400, err);
                    }
                });
            });

        });
    }

};
