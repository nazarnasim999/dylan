const mongoose = require('mongoose');

const makepaymentSchema = new mongoose.Schema({
    
    duration: { type: String, required: true },
    cost: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },

    createdAt: { type: Date, default: Date.now },
   
});

const Makepayments = mongoose.model('Makepayments', makepaymentSchema);

module.exports = Makepayments;
