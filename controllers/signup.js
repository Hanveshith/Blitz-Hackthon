const User = require("../models").User;
const bcrypt = require("bcrypt");
const saltRounds = 10;

//get signup page logic
const getsignup = (request, response) => {
  console.log("hii get sighnup")
  console.log("csrfToken", request.csrfToken());
  response.render("signup", {
    csrfToken: request.csrfToken(),
    error: request.flash("error"),
  });
};

//post signup page logic
const postsignup = async (request, response) => {
  if (!request.body.email) {
    if (request.accepts("html")) {
      request.flash("error", "Email is required");
      return response.redirect("/signup");
    } else {
      response.status(400).json({
        message: "Email is required",
      });
    }
  }

  if (!request.body.password) {
    if (request.accepts("html")) {
      request.flash("error", "Password is required");
      return response.redirect("/signup");
    } else {
      response.status(400).json({
        message: "Password is required",
      });
    }
  }

  if (request.body.password.length < 8) {
    if (request.accepts("html")) {
      request.flash("error", "Password should be atleast 8 characters long");
      return response.redirect("/signup");
    } else {
      response.status(400).json({
        message: "Password should be atleast 8 characters long",
      });
    }
  }

  if (!request.body.firstname) {
    if (request.accepts("html")) {
      request.flash("error", "First Name is required");
      return response.redirect("/signup");
    } else {
      response.status(400).json({
        message: "First Name is required",
      });
    }
  }

  if (!request.body.role) {
    if (request.accepts("html")) {
      request.flash("error", "Role is required");
      return response.redirect("/signup");
    } else {
      response.status(400).json({
        message: "Role is required",
      });
    }
  }

  try {
    let hashedPassword;
    await bcrypt.hash(
      request.body.password,
      saltRounds,
      async function (err, hash) {
        if (hash) {
          hashedPassword = hash;

          try {
            await User.create({
              firstName: request.body.firstname,
              lastName: request.body.lastname,
              email: request.body.email,
              password: hashedPassword,
              role: request.body.role,
            });


            if (request.accepts("html")) {
              request.flash("success", "Account succefully created");
              return response.redirect("/login");
            } else {
              response.status(201).json({
                user: {
                  firstName: request.body.firstname,
                  lastName: request.body.lastname,
                  email: request.body.email,
                  role: request.body.role,
                },
                message: "Account succefully created",
              });
            }
          } catch (err) {
            if (err.name === "SequelizeValidationError") {
              if (request.accepts("html")) {
                const errorMessages = err.errors.map((error) => error.message);
                request.flash("error", errorMessages);
                return response.redirect("/signup");
              } else {
                response.status(400).json({
                  message: err.errors.map((error) => error.message),
                });
              }
            } else if (err.name === "SequelizeUniqueConstraintError") {
              if (request.accepts("html")) {
                request.flash("error", "User Already Exists");
                return response.redirect("/signup");
              } else {
                response.status(400).json({
                  message: "User Already Exists",
                });
              }
            } else {
              if (request.accepts("html")) {
                request.flash("error", "An unexpected error occurred");
                return response.redirect("/signup");
              } else {
                response.status(500).json({
                  message: "An unexpected error occurred",
                });
              }
            }
          }
        } else {
          if (request.accepts("html")) {
            request.flash("error", "Password is required");
            return response.redirect("/signup");
          } else {
            response.status(400).json({
              message: "Password is required",
            });
          }
        }
      },
    );
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      if (request.accepts("html")) {
        const errorMessages = err.errors.map((error) => error.message);
        request.flash("error", errorMessages);
        return response.render("signup", { error: request.flash("error") });
      } else {
        response.status(400).json({
          message: err.errors.map((error) => error.message),
        });
      }
    } else if (err.name === "SequelizeUniqueConstraintError") {
      if (request.accepts("html")) {
        request.flash("error", "User Already Exists");
        return response.render("signup", { error: request.flash("error") });
      } else {
        response.status(400).json({
          message: "User Already Exists",
        });
      }
    } else {
      if (request.accepts("html")) {
        request.flash("error", "An unexpected error occurred");
        return response.render("signup", { error: request.flash("error") });
      } else {
        response.status(500).json({
          message: "An unexpected error occurred",
        });
      }
    }
  }
};

module.exports = { getsignup, postsignup };
