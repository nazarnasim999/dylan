const mongoose = require('mongoose');
const { Schema } = mongoose;
const Expert_Gig_Schema = mongoose.model('expert_create_gig', new Schema({
    vender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    gig_title: {
        type: String,
        required: true
    },
    gig_discription: {
        type: String,
        required: true
    },
    gig_image: {
        type: String,
        required: true
    },
    keywords: {
        type: Array,
        // required: true
    },
}, { timestamps: true }
))
module.exports = { Expert_Gig_Schema }