const mongoose = require('mongoose')

const patientProfileSchema = new mongoose.Schema({
  imageUrl: {
    type: String
  },
  user_id : {
    id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
}
})

module.exports = mongoose.model('PatientProfile', patientProfileSchema)