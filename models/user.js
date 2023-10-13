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
    authkey: {
        type: String,
        required: false
    }
})


module.exports = mongoose.model('API', userSchema)