
/*
 * GET users listing.
 */

User = require('../models/userModel');

module.exports = function(app) {

    // Auth middlewares

    function basicAuthorize(req, res, next) {
        if (req.body.username && req.body.password) {
            User.findOne({username: req.body.username}, function(err, user) {
                if (err) {
                    console.log("Error: "+err);
                    res.send("Error", 405);
                } else {
                    if (user.authenticate(req.body.password))
                        next();
                }
            });
        } else {
            res.send("Unauthorized", 401);
        }
    }

    var doLogin = function(req, res) {
        res.send({token: 0});
    }

    var createTestUser = function(req, res) {
        var theUser = new User({
            username: "test",
            password: "test123",
        });
        theUser.save(function(err) {
            if (err) throw err;
            console.log("User has been created");
            res.send("User has been created");
        });
    }

    app.post('/api/login', basicAuthorize, doLogin);
    app.get('/api/createTestUser', createTestUser);
    app.all("/api/*", function(req, res){ res.send("Hola:)")});
}