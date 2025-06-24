const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    username: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    }
});

module.exports = model("User", UserSchema, "users");