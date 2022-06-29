const BigPromise =require('../middlewares/bigPromise')

exports.home = BigPromise((req, res) => {
  res.status(200).json({
    success: true,
    greetings: "hello from backend",
  });
});

exports.dummyCheck = (req, res) => {
  res.status(200).json({
    success: true,
  });
};