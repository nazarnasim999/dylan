const mongoose = require('mongoose');

const reqSessionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Customer model
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Vendor model
        required: true,
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Vendor model
    },
    expertFound: {
        type: Boolean,
        required: true,
        default: false,
    },
    accepted: {
        default: false,
        type: Boolean,
        // required: true,
    }
});

const Req_Session = mongoose.model('Request_Session', reqSessionSchema);

module.exports = Req_Session;

// vendor
// customer => admin/expert
// expert admin => acpt
