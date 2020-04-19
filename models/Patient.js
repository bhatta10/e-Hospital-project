const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    tokenname: {
        type: String,
        required: true
    },
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const Patient = mongoose.model('Patient',PatientSchema);

module.exports =  Patient;

