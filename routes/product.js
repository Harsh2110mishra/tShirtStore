const express = require("express");
const router = express.Router();

// Product controllers
const {
  addProduct,
  getAllProducts,
  getAdminAllProducts,
  getOneProduct,
  updateProductAdmin,
  deleteProductAdmin,
  addAndUpdateReview,
  deleteReview,
  getAllProductReviews
} = require("../controllers/productControllers");

// middleware imports
const { isLoggedIn, customRole } = require("../middlewares/user");

// All user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);

// Logged in users route
router.route("/product/addReview").put(isLoggedIn, addAndUpdateReview);
router.route("/product/deleteReview").delete(isLoggedIn, deleteReview);
router.route("/product/reviews/:id").get(isLoggedIn, getAllProductReviews);


// Admin routes
router.route("/admin/addProduct").post(isLoggedIn, customRole('admin'), addProduct);
router.route("/admin/AllProducts").get(isLoggedIn, customRole("admin"), getAdminAllProducts);
router.route("/admin/product/:id").put(isLoggedIn, customRole("admin"), updateProductAdmin).delete(isLoggedIn, customRole("admin"), deleteProductAdmin);

module.exports = router;
