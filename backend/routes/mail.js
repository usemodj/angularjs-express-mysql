module.exports = function(app) {
    //password mail post
    app.post('/auth/mail',
        function(req, res, next) {
            var transport = req.transport;
            console.log(req.body);
            var email = req.body.email;
            var message = req.body.message;
            transport.sendMail(message, function(error){
                if(error){
                    console.log('Error occured');
                    console.log(error.message);
                    return next(error);
                }
                console.log('Message sent successfully!');

                // if you don't want to use this transport object anymore, uncomment following line
                //transport.close(); // close the connection pool
                return res.json(200, 'Message sent successfully!');
            });

        });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.send(401);
    }
}
