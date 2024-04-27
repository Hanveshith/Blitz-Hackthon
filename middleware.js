//midilware function to check is user the educator or not
const isadmin = (req, res, next) => {
    if (req.user && req.user.role === "trainer") {
      return next();
    } else {
      const message =
        "You don't have permission to access this page as an educator.";
      return res.status(403).render("error", { message });
    }
  }
  
  //midilware function to check is user the student or not
  const ispeople = (req, res, next) => {
    if (req.user && req.user.role === "traine") {
      return next();
    } else {
      const message =
        "You don't have permission to access this page as an student.";
      return res.status(403).render("error", { message });
    }
  };
  
  //midilware function to check is user the loged in or not
  const isLogedIn = (request, response, next) => {
    if (request.isAuthenticated()) {
      if (request.user.role === "trainer") {
        response.redirect("/trainer");
      } else {
        response.redirect("/traine");
      }
    } else {
      next();
    }
  };
  
  //midilware function to check is he the educator or not for /login route
  const logincheck = (request, response, next) => {
    if (request.isAuthenticated()) {
      next();
    } else {
      console.log("user", request.user);
      response.redirect("/login");
    }
  };
  
  //exporting the above middleware functions
  module.exports = { isadmin, ispeople, isLogedIn, logincheck };
  