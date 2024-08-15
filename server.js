const dotenv = require('dotenv').config()
const express = require('express');
const path = require('path')
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3002;
const db = process.env.dbPassword;
const passport = require('passport');
require("./config/passport")(passport);
const flash = require('connect-flash');
const session = require('express-session');
const cors = require("cors")


//mongoose connection
mongoose.connect(db,{})
.then(() => console.log('connected to MongoDB'))
.then(() => app.listen(PORT,()=>console.log(`Server Running On Port: ${PORT}`)))
.catch((err)=> console.log(err));

//EJS
app.set('view engine','ejs');
//app.use(expressEjsLayout);

//BodyParser
app.use(express.urlencoded({extended : false}));
app.use(express.static(__dirname + '/public'));


//Initialize Helmet
//app.use(cors());
//app.use(helmet({}));

//express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());

//use flash
app.use(flash());
app.use((req,res,next)=> {
     res.locals.success_msg = req.flash('success_msg');
     res.locals.error_msg = req.flash('error_msg');
     res.locals.error  = req.flash('error');
   next();
})

//Routes
app.use('/',require('./routes/transactions'));
app.use('/users',require('./routes/users'));
