const mongoose = require('mongoose');

const { Schema } = mongoose;
const Customer_Schema = mongoose.model('create_customer', new Schema({

    type: {
        type: String,
        required: true
    },
    Profile_Image: {
        type: String,
        // required: true
    },
    Name: {
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
    Home_Address: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
        required: true
    },
    phoneno: {
        type: Number,
        // required: true
    },
    

}, { timestamps: true }
))


module.exports = { Customer_Schema }
