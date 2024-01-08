const mongoose = require('mongoose');
const { user_role_constanst, user_type_constant } = require('../utils/constants');

const { Schema } = mongoose;
const User_Tokens_Schema = mongoose.model('auth-tokens', new Schema({
    access_token: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true,
        ref:'users'
    },
   
          
}, { timestamps: true }
))


module.exports = { User_Tokens_Schema }
