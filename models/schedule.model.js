const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // jobId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerJobDetails: { type: Object, required: true },
    customerDetails: { type: Object, required: true },
    vendorBudget: { type: Number, required: true },
    time: { type: String,
        //  required: true
         },
    date: { type: String,
        //  required: true
         },


    time0: { type: Number , 
        // required: true 
    },
    time1: { type: Number ,
        //  required: true 
        },
    time2:{ type: Number , 
        // required: true 
    },

    shedule_descriptions: {type: String,
    },


    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    Paystatus: { type: String, enum: ['unPaid', 'Paid', ,'Payment Created'], default: 'unPaid' },
    createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
