const mongoose = require('mongoose');

const { Schema } = mongoose;
const User_Auth_Schema = mongoose.model('user', new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
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
    verified: {
        type: Boolean,
        default:false,
        required:true
    },
    profile_image:{
        type: String,
        required: true
    }

          
}, { timestamps: true }
))


module.exports = { User_Auth_Schema }
