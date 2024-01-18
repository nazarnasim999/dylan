const mongoose = require('mongoose');

const { Schema } = mongoose;
const timeSchema = new Schema({
    date: { type: String, required: true },
    times: { type: [String], required: true },
});
const Customer_Job_Schema = mongoose.model('create_customer_job', new Schema({

    type: {
        type: String,
        required: true
    },
    selected_queries: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: String,
        required: true
    },

    zipcode: {
        type: String,
        required: true
    },

    emergency: {
        type: String,
        
      },

    // to_date: { type: String, required: true },
    // to_time: { type: String, required: true },
    // from_time: { type: String, required: true },


    // to_date: {
    //     type: Date,
    //     required: true
    // },

    // from_date: {
    //     type: Date,
    //     required: true
    // },
    location: {
        type: String,
        required: true
    },

    // title: {
    //     type: String,
    //     required: true
    // },
    images: {
        type: Array,
        required: true
    },

   
    vendor_level: {
        type: String,
       
    },
    availablity_times: {
        type: [timeSchema], // Array of dates with times
    },
    Budget: {
        type: Number,
        
    },


}, { timestamps: true }
))


module.exports = { Customer_Job_Schema }
