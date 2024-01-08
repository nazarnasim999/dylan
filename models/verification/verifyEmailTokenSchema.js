const mongoose = require("mongoose");

const { Schema } = mongoose;
const verifyEmailSchema = mongoose.model("verificationToken", new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    OTP: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        expires: 36000,
        default: Date.now
    },
   

}, { timestamps: true }))


module.exports = verifyEmailSchema