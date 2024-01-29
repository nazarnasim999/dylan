// const mongoose = require('mongoose');

// const { Schema } = mongoose;
// const timeSchema = new Schema({
//     date: { type: String, required: true },
//     times: { type: [String], required: true },
// });


// const time0Schema = new Schema({
//     date: { type: String, required: true },
//     times: { type: [String], required: true },
// });

// const time1Schema = new Schema({
   
//     time1: { type: [Number]},
// });
// const Customer_Job_Schema = mongoose.model('create_customer_job', new Schema({

//     type: {
//         type: String,
//         // required: true
//     },
//     selected_queries: {
//         type: String,
//         // required: true
//     },
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         // required: true
//     },
//     details: {
//         type: String,
//         // required: true
//     },
//     zipcode: {
//         type: String,
//         // required: true
//     },
//     emergency: {
//         type: String,
//         // required: true
//     },

//     note: {
//         type: String,
//         // required: true
//     },

//     // to_date: { type: String, required: true },
//     // to_time: { type: String, required: true },
//     // from_time: { type: String, required: true },


//     // to_date: {
//     //     type: Date,
//     //     required: true
//     // },

//     // from_date: {
//     //     type: Date,
//     //     required: true
//     // },
//     location: {
//         type: String,
//         // required: true
//     },

//     // title: {
//     //     type: String,
//     //     required: true
//     // },
//     images: {
//         type: Array,
//         // required: true
//     },

   
//     vendor_level: {
//         // type: String,
       
//     },
//     availablity_times: {
//         type: [timeSchema], // Array of dates with times
//     },


//     availablity_time: {
//         type: [time0Schema], // Array of dates with times
//     },
//     Budget: {
//         type: Number,
        
//     },
//     time1: { 
//         type: [time1Schema],
//         //  required: true 
//         }


// }, { timestamps: true }
// ))


// module.exports = { Customer_Job_Schema }
















const mongoose = require('mongoose');

const { Schema } = mongoose;

const timeSchema = new Schema({
    date: { type: String },
    times: { type: [String] },
});

const time0Schema = new Schema({
    date: { type: String },
    times: { type: [String] },
});

const time1Schema = new Schema({
    time1: { type: [Number] },
});

const Customer_Job_Schema = mongoose.model(
    'create_customer_job',
    new Schema(
        {
            type: { type: String },
            selected_queries: { type: String },
            user_id: { type: mongoose.Schema.Types.ObjectId },
            details: { type: String },
            zipcode: { type: String },
            emergency: { type: String },
            note: { type: String },
            location: { type: String },
            images: { type: Array },
            vendor_level: { type: String },
            availablity_times: { type: [timeSchema] },  // Array of dates with times
            availablity_time: { type: [time0Schema] }, // Array of dates with times
            Budget: { type: Number },
            time1: { type: [time1Schema] },           // Array of numbers
        },
        { timestamps: true }
    )
);

module.exports = { Customer_Job_Schema };

