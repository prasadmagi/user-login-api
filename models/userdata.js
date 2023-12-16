const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    },

})


module.exports = mongoose.model('userdata', userSchema)