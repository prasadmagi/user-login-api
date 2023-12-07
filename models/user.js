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
    role: {
        type: Boolean,
        required: true,
        default: false,
    }
})


module.exports = mongoose.model('apis', userSchema)