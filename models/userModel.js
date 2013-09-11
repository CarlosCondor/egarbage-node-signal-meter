// User model

var crypto      = require('crypto');


module.exports = function(app, mongoose) {

    var userSchema = new mongoose.Schema({
        username: { type: String, required:true, unique:true },
        hashed_password: { type: String, reqquired:true },
        salt: {type:String, required:true}
    });

    userSchema.virtual('password')
        .set(function(password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        })
        .get(function() {
            return this._password;
        });

    userSchema.method('authenticate', function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    });

    userSchema.method('makeSalt', function() {
        // random salt based on date and random number.. any thing is ok.
        return Math.round((new Date().valueOf()* Math.random()))+"";
    });

    userSchema.method('encryptPassword', function(password) {
        // encrypt password with a random generated salt
        return crypto.createHmac('sha1', this.salt).update(password).digest("hex");
    });

    userSchema.method('generateToken', function() {
        // Generate unique token
        return crypto.createHash('md5').update(this.username+ Date().toString()).digest("hex");
    });

    userSchema.pre('save', function(next) {
        this.token = this.generateToken();

        if (!validatePresenceOf(this.password || this.hashed_password)) {
            next(new Error("Empty credentials"));
        } else {
            next();
        }
    });

    module.exports =  mongoose.model("User", userSchema);


    function validatePresenceOf(field) {
        return field && field.length;
    }
}