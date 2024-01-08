const mongoose = require('mongoose');

const { Schema } = mongoose;
const Admin_Auth_Schema = mongoose.model('Admin', new Schema({
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    }

}, { timestamps: true }
))


module.exports = { Admin_Auth_Schema }
