const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customerId: String,
    vendorId: String,
    scheduleId: String,
    amount: Number,
    paymentId: String,
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
