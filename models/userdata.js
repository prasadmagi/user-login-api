const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "apis"
    },
    data: {
        type: String,
    },

})


module.exports = mongoose.model('userdata', userSchema)