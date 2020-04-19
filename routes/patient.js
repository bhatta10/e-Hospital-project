// /login /register comes here
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const app = express();
//patient model
const Patient = require('../models/Patient');
// doctor model
const Doctor = require('../models/Doctor');

const { ensureAuthenticated } = require('../config/auth');
const { ensureAuthenticated1 } = require('../config/auth');


//login page
router.get('/login',(req,res) => res.render('login')); //arrowfunc with req and res object

//reg page
router.get('/register',(req,res) => res.render('register')); 

//register handle
// register handle
router.post('/register',(req,res)=>{
    const { tokenname,name, email, password, password2 } = req.body;
    let errors=[];

    //check required fields
    if( !tokenname || !name  || !email || !password || !password2){
        errors.push({msg: 'Please fill in all required fields'});
    }

    //check password match
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'});
    }

    //check pass length
    if(password.length < 6){
        errors.push({msg: 'Password length should be at least six characters'});
    }

    if(errors.length>0){
        res.render('register',{   //suppose kunai condition meet garena bhane ni tei page ma basne bhayo
            errors,
            tokenname,               //register lai rendering garda errors lai pathairacha which is checked in messages 
            name,
            email,
            password,
            password2
        });
    }else{
        //validation passed
        Patient.findOne({ email:email})
            .then(patient => {
                if(patient) {
                    // exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('register',{ //if their is user re render the reg form and send error  
                        errors,   
                        tokenname,             
                        name,
                        email,
                        password,
                        password2
                    });
                }else{ //if there is new  user we have to create a user
                    const newUser = new Patient({
                        tokenname,
                        name, // name:name,
                        email,
                        password
                    });

                   // Hash password
                   bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err,hash)=>{
                        if(err) throw err;
                        //set password to hash
                        newUser.password = hash;
                        //save user
                        newUser.save()
                            .then(patient => {
                                req.flash('success_msg','You are now registered and can log in'); //calling flash msg after success
                                res.redirect('/patient/login'); //localhst ma k path handa kata jane 
                            })
                            .catch(err => console.log(err));
                    }))
                }
            });
    }

});

// // login handle to use local strategy rather than directly /users/login
// router.post('/login',(req,res,next)=>{  //handling post req to user/login
//     passport.authenticate('local',{
//         successRedirect: '/patientdashboard',
//         failureRedirect: '/patient/login',
//         failureFlash: true
//     })(req,res,next);
// }); 

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });

// View doctors
router.get('/viewdoctors',ensureAuthenticated, async(req, res)=>{
    const doctors = await Doctor.find({})
    res.render('viewdoctors',{
      doctors,
      user:req.user
    });
  });

module.exports = router;