const mongoose = require('mongoose');

const { Schema } = mongoose;
const Vendor_Schema = mongoose.model('create_vendor', new Schema({

    type: {
        type: String,
        required: true
    },
    selected_queries: {
        type: Array,
        required: true
    },
    Profile_Image: {
        type: String,
       
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
    // experience: {
    //     type: String,
    //     required: true
    // },
    Home_Address: {
        type: String,
        required: true
    },
    zipCode: {

        
        type: Number,
        required: true
    },
    phoneno:{
        type: Number,
        required: true
    }
        

    


}, { timestamps: true }
))


module.exports = { Vendor_Schema }

