const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();
const cloudinary = require('cloudinary');
const path = require('path')
const fs = require('fs')

require('../models/PatientProfile');
require('../handlers/cloudinary');

const { ensureAuthenticated } = require('../config/auth');
const upload = require('../handlers/multer');
const Patient = mongoose.model('Patient');
const PatientProfile = mongoose.model('PatientProfile');




//patient profile page
router.get('/patientprofile',ensureAuthenticated, async (req, res) => {
    const user_id = req. user._id;
    const patient = await Patient.findById(user_id);
    const profileimage = await PatientProfile.find({"user_id.id" : patient._id})
    const imagePath = path.join(__dirname, '/public/images');
    res.render('patientprofile', {
    profileimage,
    user:req.user
    })
  })

// Upload profile photo  
router.post('/change_photo', upload.single('image'), async(req,res) => {
    const result = await cloudinary.v2.uploader.upload(req.file.path) 
    const profile = new PatientProfile()
    profile.imageUrl = result.secure_url
    profile.user_id.id = req.user._id
    await profile.save()
    res.redirect('/patientprofile')
  })


module.exports = router
