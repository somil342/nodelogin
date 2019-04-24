const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const url =require('url');
// global

var mm;
var passw;
// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

//forget page
router.get('/forget', forwardAuthenticated, (req, res) => res.render('forget'));


//change page
router.get('/change', forwardAuthenticated, (req, res) => res.render('change'));

//change password
router.post('/change',(req,res)=>{
	
	
	  const { otp, password, password2 } = req.body;
  let errors = [];
 
  if (!otp || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

if(otp!=passw) {  errors.push({ msg: 'Incorrect Otp' });}

  if (errors.length > 0) {
    res.render('change', {
      errors,
      otp,
      password,
      password2
    });
  }
 else
 {
	
		User.findOne({email:mm}).then(user=>{
			user.password=password;
			
			 bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Password changed , can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
		
		});
	
	}
	

});

//forget password
router.post('/forget',(req,res)=>{
	const email=req.body.email;
	let errors = [];
	
console.log(email);	
	User.findOne({email:email}).then(user=>{
		if(user)
		{
			const p=Math.floor(Math.random()*1000).toString();
			console.log(p);
		    mm=user.email;	
			 passw=p;
			
	//node mailer		
			var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jsomil071@gmail.com',
    pass: 'somil@1996'
  }
});

var mailOptions = {
  from: 'jsomil071@gmail.com',
  to: email,
  subject: 'Password Recovery',
  text: 'your otp for chatbot password change is'+passw
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
	
			    req.flash(
                  'success_msg',
                  'Otp has been sent ,Now You can Change Password!'
                );
				const k=email;
				console.log(k);
				res.redirect(url.format({
       pathname:"/users/change",
       query:k
	   })
	 );
		//res.redirect('change',{k});
	// node mailer		
		}
		else
		{
	   console.log('not user');
	   errors.push({ msg: 'User Not Found !' });
       res.render('forget',{errors});		
		}
	})
	.catch(err => console.log(err));
	
	
});


//database list

// Register
router.post('/register', (req, res) => {
	
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
	
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
