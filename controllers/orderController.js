const Order = require("../models/order");
const Product = require("../models/Product");

// middlewares
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customErrors");

exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id,
    });

    res.status(200).json({
        success: true,
        order,
    });
});

exports.getOneOrderdetails = BigPromise(async (req, res, next) => {

    // populate will further break the user field and show name & email of user that placed this order
    // It can be used when a field can be futher breakdown like user filed which will show only id if we don't use populate
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new CustomError('No order found', 404));
    }
    res.status(200).json({
        success: true,
        order
    })
});

exports.getAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });
    if (!orders) {
        return next(new CustomError("No order found", 404));
    }
    res.status(200).json({
        success: true,
        orders,
    });
});

// Admin controllers
exports.getAdminAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();
  if (!orders) {
    return next(new CustomError("No order found", 404));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.updateAdminOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id); 
    if (order.orderStatus === 'Delivered'){
        return next(new CustomError('Order is already delivered', 401));
    }
    // updating order status
    order.orderStatus = req.body.orderStatus;

    // updating product stocks
    order.orderItems.forEach(async prod => {
        await productStock(prod.product, prod.quantity);
    });
    // updating
    await order.save();

     res.status(200).json({
       success: true,
       order,
     });
});

exports.deleteAdminOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new CustomError("Order not found", 401));
  }
    
  // updating order status
    await order.remove();

  res.status(200).json({
    success: true,
  });
});

// async function to cal product stocks
const productStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}; 
