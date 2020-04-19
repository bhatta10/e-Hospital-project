const express = require('express');
const mongoose = require('mongoose')
const uuid = require('uuid');
const router = express.Router();
require('../../models/Feedback');

const Feedback = mongoose.model('Feedback');

router.get('/seefeedbacks', async(req, res)=>{
  const member = await Feedback.find({})
  res.render('seefeedbacks',{
    user:req.user,
    member
  });
});

router.get('/sendfeedbacks', function(req, res){
  res.render('feedback',{
    user:req.user,
    pageTitle: 'Feedback',
  });
});


// Create Member
router.post('/feedbackform', (req, res) => {
const member = new Feedback()
member.name = req.body.name
member.title = req.body.title
member.message=req.body.message
member.save()
req.flash('success_msg','Feedback Sent.Thank you for your feedbacks!')
res.redirect('/sendfeedbacks')
});
      


      // For API 


      // Gets All Members
      // router.get('/data', (req, res) => res.json(members));
        
      // Create Member
      // router.post('/feedbackform', (req, res) => {
      //   const newMember = {
      //     name: req.body.name,
      //     title: req.body.title,
      //     message: req.body.message
      //   };
      //   members.push(newMember);
      //   res.send('Feedback Sent <br> Thanks for feedback');
      // });//
      
      
      
      // Get Single Member
// router.get('/seefeedbacks/:name', (req, res) => {
  //   const found = members.some(member => member.name === (req.params.name));
  
  //   if (found) {
    //     res.json(members.filter(member => member.name === (req.params.name)));
    //   } else {
      //     res.status(400).json({ msg: `No member with the name of ${req.params.name}` });
      //   }
      // });
      


      // // Update Member
      // router.put('/:id', (req, res) => {
        //   const found = members.some(member => member.id === parseInt(req.params.id));

        //   if (found) {
          //     const updMember = req.body;
          //     members.forEach(member => {
            //       if (member.id === parseInt(req.params.id)) {
//         member.name = updMember.name ? updMember.name : member.name;
//         member.email = updMember.email ? updMember.email : member.email;

//         res.json({ msg: 'Member updated', member });
//       }
//     });
//   } else {
//     res.status(400).json({ msg: `No member with the id of ${req.params.id}` });
//   }
// });

// // Delete Member
// router.delete('/:id', (req, res) => {
//   const found = members.some(member => member.id === parseInt(req.params.id));

//   if (found) {
//     res.json({
//       msg: 'Member deleted',
//       members: members.filter(member => member.id !== parseInt(req.params.id))
//     });
//   } else {
//     res.status(400).json({ msg: `No member with the id of ${req.params.id}` });
//   }
// });

module.exports = router;