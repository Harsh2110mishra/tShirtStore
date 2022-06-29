const BigPromise = require('../middlewares/bigPromise');
const stripe = require("stripe")(process.env.STRIPE_PUBLIC_KEY);


// stripe
exports.sendStripePublicKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        StripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    });
});

// docs: https://stripe.com/docs/payments/payment-intents
//paymentIntent Oject: https://stripe.com/docs/api/payment_intents/object 
exports.captureStipePayments = BigPromise(async (req, res, nexr) => {
    const price = req.body.price;
    const paymentIntent = await stripe.paymentIntents.create({
        unit_amount: price,
        currency: "inr",
      
        // optional it's recommended on stackoverflow
        metadata: { integration_check: "accept_a_payment" },
    });
    res.status(200).json({
        success: true,
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
    });
});


// Razorpay
// For integration : https://www.notion.so/blackeyedemon/Payment-Gateway-Razorpay-e2cfc2896f264b07990a5c379c5797aa
exports.sendRazorPayAPiKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    StripePublicKey: process.env.RAZORPAY_KEY_ID,
  });
});

exports.captureRazorpayPayments = BigPromise(async (req,res,next) => {
    const amount = req.body.amount; //amount from body
    const receipt_id = Date.now(); // for generating unique id
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: amount * 100, //100 multiply because it always is in paise
      currency: "INR",
      receipt: `receipt#${receipt_id}`,
    });
    const result = {
      success: true,
      amount: amount,
      receipt_id: receipt_id,
      order: order,
    };
    console.log("result: ", result);
    res.status(200).send(result);
})