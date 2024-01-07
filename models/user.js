const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: String,
        required: true,
        default: "No",
    },
    isActive: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    }
})


module.exports = mongoose.model('userapi', userSchema)