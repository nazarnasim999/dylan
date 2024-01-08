const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Customer model
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Vendor model
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    // Add other fields if needed
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
