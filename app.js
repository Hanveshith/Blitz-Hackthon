 
//importing the predefined modules 
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require("bcrypt");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const csrf = require("tiny-csrf");
const saltRounds = 10;


//importing the routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


const {isadmin, ispeople, isLogedIn, logincheck} = require("./middleware.js");


const { User } = require("./models");

const signup =  require("./routes/signup");


//intializing the express app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//setting up the middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh some key!"));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(flash());


const sessionStore = new pgSession({
  conObject: {
    connectionString:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_URL
        : "postgres://postgres:0826%40ABHUVI@localhost:5432/lms_dev_db",
  },
  tableName: "sessions",
});

app.use(
  session({
    secret: "this is the secret key for lms",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: sessionStore,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
console.log("Passport initialization completed successfully");

// Defining the authUser function for the local strategy
const authUser = async (mail, password, done) => {
  try {
    const user = await User.findOne({ where: { email: mail } });
    if (!user) {
      return done(null, false, { message: "User Not Found" });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid Password" });
      }
    });
  } catch (err) {
    console.error("Error in authUser:", err);
    return done(err);
  }
};

// Defining which strategy of passportjs to use
passport.use(
  new LocalStrategy(
    {
      usernameField: "mail",
      passwordField: "password",
    },
    authUser,
  ),
);

// Serializing the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializing the user
passport.deserializeUser(async (id, done) => {
  await User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// CSRF token setup
const csrfProtection = csrf("123456789iamasecret987654321look", [
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
]);
app.use(csrfProtection);

// Defining the routes
app.get("/login", isLogedIn, (request, response) => {
  response.render("signin", {
    error: request.flash("error"),
    success: request.flash("success"),
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    if (request.accepts("html")) {
      if (request.user.role === "admin") {
        response.redirect("/admin");
      } else {
        response.redirect("/people");
      }
    } else {
      response.status(200).json({
        user: request.user,
        message: "Login successful",
      });
    }
  },
);

app.use("/signup", csrfProtection, isLogedIn, signup);

app.get("/", logincheck, (request, response) => {
  response.redirect("/login");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//exporting the app module
module.exports = app;
