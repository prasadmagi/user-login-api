const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    user_id: {
        type: String,
        required: true
    },
    data: {
        type: String,
    },

})


module.exports = mongoose.model('userdata', userSchema)