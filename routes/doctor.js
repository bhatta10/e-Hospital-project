const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const { ensureAuthenticated1 } = require('../config/auth');


//patient model
const Patient = require('../models/Patient');
// doctor model
const Doctor = require('../models/Doctor');
const Report = require('../models/Report')

// login page
router.get('/Dlogin',(req,res) => res.render('logindr'));

//register page
router.get('/Dregister',(req,res) => res.render('registerdr')); 

// register handle
router.post('/Dregister',(req,res)=>{
    const { name, email, password, password2 } = req.body;
    let errors=[];

    //check required fields
    if( !name  || !email || !password || !password2){
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
        res.render('registerdr',{   //suppose kunai condition meet garena bhane ni tei page ma basne bhayo
            errors,               //register lai rendering garda errors lai pathairacha which is checked in messages 
            name,
            email,
            password,
            password2
        });
    }else{
        //validation passed
        Doctor.findOne({ email:email})
            .then(doctor => {
                if(doctor) {
                    // exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('registerdr',{ //if their is user re render the reg form and send error  
                        errors,                
                        name,
                        email,
                        password,
                        password2
                    });
                }else{ //if there is new  user we have to create a user
                    const newUser = new Doctor({
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
                            .then(doctor => {
                                req.flash('success_msg','You are now registered and can log in'); //calling flash msg after success
                                res.redirect('/doctor/Dlogin'); //localhst ma k path handa kata jane 
                            })
                            .catch(err => console.log(err));
                    }))
                }
            });
    }

});

// login handle to use local strategy rather than directly /users/login
// router.post('/Dlogin',(req,res,next)=>{  //handling post req to user/login
//     passport.authenticate('local',{
//         successRedirect: '/doctordashboard',
//         failureRedirect: '/doctor/Dlogin',
//         failureFlash: true
//     })(req,res,next);
// }); 

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });

// View patients
  router.get('/viewpatients',ensureAuthenticated1, async(req, res)=>{
    const patients = await Patient.find({})
    res.render('viewpatients',{
      patients,
      user:req.user
    });
  });

 // view more details of patient 

router.param('id', function(req, res, next, _id){
	Patient.findOne({_id}, function(err,details){
			if(err) res.json(err);
			else
			{
				req.patient = details;
				next();
			}
        });  
})
router.param('id', function(req, res, next,patientid){     
    Report.find({patientid},function(err,reports){
            if(err)
            res.json(err);
            else
            {
                req.report = reports;
                next();
            }
        });
    })  
        
 
router.get('/:id', ensureAuthenticated1, async(req, res)=>{
	res.render('patientdetails', {
    report : req.report,
    patient: req.patient,
    user:req.user
    });
});


module.exports = router;