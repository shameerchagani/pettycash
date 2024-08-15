const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { forwardAuthenticated } = require("../config/auth");
const { ensureAuthenticated } = require("../config/auth");

const user_register = (req, res) => {
  if(req.user.role!=='admin'){
  res.render('404',{title:"404 - Not Found"})
  }else{
  res.render("register", { title: "Register" });
  }
};

//User Register Handle
const user_register_handle = (req, res) => {
  const { name, email, password, password2, role } = req.body;
  let errors = [];
  //console.log(req.body);
  //console.log(' Name ' + name + ' email :' + email + ' pass:' + password + 'role:' + role);
  if (!name || !email || !password || !password2 || !role) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "passwords dont match" });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: "password atleast 6 characters" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
      role: role,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: "email already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          role,
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
          role: role,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((value) => {
                // console.log(value);
                req.flash("success_msg", "You have now registered!");
                res.redirect("/users/login");
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
};

//Login Handler
const user_login_handle = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
    author: req.body,
    title: "Login",
  })(req, res, next);
};

//Logout Handler
const user_logout = (req, res) => {
  req.logout(()=>{
    req.flash("success_msg", "Now logged out");
  });
  res.redirect("/users/login");
};

//Export All Modules.
module.exports = {
  user_register,
  user_register_handle,
  user_login_handle,
  user_logout,
};
