const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({

    name: {
        type:String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const Feedback = mongoose.model('Feedback',FeedbackSchema);

module.exports =  Feedback;

