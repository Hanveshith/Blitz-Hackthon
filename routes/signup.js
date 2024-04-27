const express = require("express");
const route = express.Router();
const { getsignup, postsignup } = require("../controllers/signup");

route.get("/", getsignup);
route.post("/", postsignup);

module.exports = route;
