const express = require('express');
const router = express.Router();

const {
  signUp,
  login,
  logout,
  forgetPassword,
  resetPassword,
  loggedInUserDetail,
  updatePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require("../controllers/userControllers");

// middleware imports
const { isLoggedIn, customRole } = require("../middlewares/user");

// routes controllers
router.route("/signUp").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgetPassword").post(forgetPassword);
router.route("/password/reset/:token").post(resetPassword);

// first route will check isLoggedIn and then it will proceed futher middlewares
router.route("/userDetail").get(isLoggedIn, loggedInUserDetail); // first route will check isLoggedIn and then loggedInUserDetail
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/userDashboard/update").post(isLoggedIn, updateUserDetails);

// Custom roles routes
// admin
router.route("/admin/users").get(isLoggedIn, customRole('admin'), adminAllUsers);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser) // this route for getting one user by passing id in params
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser) // same route for get, put & delete requests
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);
  
//manager
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUsers);

module.exports = router;