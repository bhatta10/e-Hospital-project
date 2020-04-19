const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash= require('connect-flash');
const passport = require('passport');
const bodyparser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
members = require('./models/PatientProfile');
// const adminRouter = require('./routes/admin.router');
// const path = require('path');

const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);

app.use('/public/images/',express.static('./public/images'));

const { ensureAuthenticatedForPatient } = require('./config/auth');

//passportdr config
require('./config/passport');

//dbcongif
const db = require('./config/keys').MongoURI;

//connect to mongo
mongoose.connect(db,{useUnifiedTopology: true, useNewUrlParser: true})
    .then(()=> console.log('MongoDb connected..'))
    .catch(err => console.log(err));

//ejs
app.use(expresslayouts);
app.set('view engine','ejs');

//method override
app.use(methodOverride('_method'));

//bodyparser // when i removed this balla admin wala kam milyo tara yedi registration ma length ko error ayo bhane dekhi yo unmark garne
app.use(express.urlencoded({extended:true}));

//bodyparsser
app.use(bodyparser.json())

//express-session middleware
app.use(session({
    secret: 'secret',//can be whatever
    resave: true,
    saveUninitialized:true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

//call routes
app.use('/', require('./routes/index'));
app.use('/patient',require('./routes/patient'));
app.use('/doctor',require('./routes/doctor'));
app.use('/',require('./routes/reports'));
// app.use('/admin', adminRouter);
app.use('/',require('./routes/api/feedback'));
app.use('/',require('./routes/patientprofile'));
app.use('/',require('./routes/chat'));

//patient login handle
app.post('/patient/login', 
  passport.authenticate('patient', 
  { successRedirect: '/patientdashboard', 
    failureRedirect: '/patient/login',
    failureFlash: true 
  }));

//doctor login handle  
app.post('/doctor/Dlogin', 
  passport.authenticate('doctor',
   { successRedirect: '/doctordashboard',
   failureRedirect: '/doctor/Dlogin' ,
   failureFlash: true}));

//chat
   
    
   const io = socketio(server);
   const formatMessage = require('./utils/messages');
   const { userJoin, getCurrentUser, userLeave,getRoomUsers } = require('./utils/users');

   const botName = 'ChatCord Bot';

   io.on('connection', socket =>{
      //join room //this is done later
      socket.on('joinRoom',({username,room}) =>{
        const user = userJoin(socket.id,username,room);  

        socket.join(user.room);
       
      // Welcome current User  
      socket.emit('message',formatMessage(botName,'Welcome to chat board')); //display message at server welcome to ....
      //format message pachi haleko jun bata hamle text ra username lirachau botname le username text lai arko
      //format message as a whole is message

      //sabai user le herna milne lai broadcast use garne
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName,`${user.username} has joined a chat`)
          );

      // Send user and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
        });
      });

      // mathi ko yeti lai room ma garna parera tya bhitra rakheko
      // //console.log('hi');      //connection bhayo ki nai bhanera check garna milyo
      // socket.emit('message',formatMessage(botName,'Welcome to chat board')); //display message at server welcome to ....
      // //format message pachi haleko jun bata hamle text ra username lirachau botname le username text lai arko
      // //format message as a whole is message

      // //sabai user le herna milne lai broadcast use garne
      // socket.broadcast.emit('message',formatMessage(botName,'A user has joined a chat'));

      
      //for chat message
      socket.on('chatMessage' , msg => {
        const user = getCurrentUser(socket.id);
        //this msg are type gareko msg which we are catching
        // console.log(msg); //uta bata pathako message afnai console ma herna milyo aba
        //  io.emit('message',msg); //emit msg on server //suru ma
        io.to(user.room).emit('message',formatMessage(user.username,msg));// paila username ko thau ma euta string 
      });

      //when one disconnects the chat
      socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
          io.to(user.room).emit(
            'message',
            formatMessage(botName,`${user.username} has disconnected the chat`)// user bhanne nabanako bhaye yo bahira hunthyo
          );

        // Send user and room info
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
      }  
   });
});
   
const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server started on port ${PORT}`));
