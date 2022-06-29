const express = require("express");

// controllers
const {
  createOrder,
  getOneOrderdetails,
  getAllOrders,
  getAdminAllOrders,
  updateAdminOrder,
  deleteAdminOrder,
} = require("../controllers/orderController");
const router = express.Router();

// middleware
const { isLoggedIn, customRole } = require("../middlewares/user");

// routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrderdetails);
router.route("/myOrders/").get(isLoggedIn, getAllOrders);

//admin routes
router
  .route("/admin/orders/")
    .get(isLoggedIn, customRole("admin"), getAdminAllOrders);
router
  .route("/admin/orders/:id")
  .put(isLoggedIn, customRole("admin"), updateAdminOrder)
  .delete(isLoggedIn, customRole("admin"), deleteAdminOrder); 
   


module.exports = router;
