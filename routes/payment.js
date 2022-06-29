const express = require("express");
const router = express.Router();

// Imported payment controllers
const {
  sendStripePublicKey,
  sendRazorPayAPiKey,
  captureRazorpayPayments,
  captureStipePayments,
} = require("../controllers/paymentController");

// middleware imports
const { isLoggedIn } = require("../middlewares/user");

// Routes for sending keys
router.route("/sendStripeKey").get(sendStripePublicKey);
router.route("/sendRazorPayKey").get(sendRazorPayAPiKey);

// Routes for accepting payments
router.route("/payment/razorpay").post(captureRazorpayPayments);
router.route("/payment/stripe").post(captureStipePayments);


module.exports = router;