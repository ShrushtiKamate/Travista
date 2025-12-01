const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");

// SIGNUP - GET
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// SIGNUP - POST
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);

      req.login(registeredUser, (err) => {
        if (err) {
          req.flash("error", "Login error after signup");
          return res.redirect("/login");
        }

        req.flash("success", "Welcome to Travista 🎉");
        res.redirect("/");
      });
    } catch (e) {
      if (e.name === "UserExistsError") {
        req.flash("error", "Username already exists. Try logging in.");
        return res.redirect("/login");
      }

      req.flash("error", "Signup failed. Try again.");
      res.redirect("/signup");
    }
  })
);

// LOGIN - GET
router.get("/login", (req, res) => {
  res.render("users/login");
});

// LOGIN - POST
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed");
      return res.redirect("/");
    }

    req.flash("success", "Logged out successfully!");
    res.redirect("/");
  });
});

// PROFILE
router.get("/profile", isLoggedIn, (req, res) => {
  const { username, email } = req.user;
  res.render("users/profile", { username, email });
});

module.exports = router;
