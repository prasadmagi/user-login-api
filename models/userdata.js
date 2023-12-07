const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    data: {
        type: String,
        required: true
    },

})


module.exports = mongoose.model('userdata', userSchema)