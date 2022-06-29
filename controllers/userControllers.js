const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customError = require('../utils/customErrors');
const cookieToken = require('../utils/cookieToken');
const cloudinary = require('cloudinary').v2;
const emailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


exports.signUp = BigPromise(async (req, res, next) => {
    if (!req.files) {
        return next(new customError("Please upload all photo", 400));
    }
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
        return next(new customError("Please enter all required fields", 400));
    }
    let file = req.files.photo;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'users',
        crop: 'scale',
        width: 150
    });

    // creating user in db
    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })
    cookieToken(user, res); // For sending back token
    
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // Check email & password is in the body
  if (!email || !password) {
    return next(new customError("Please provide an email & password", 400));
  }
    
  // check whether a user exist with both email & password
  // .select('+password') means to search user also with password
  // instead of select we can also do User.findOne({email,password}) to search a user.  
  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new customError("You are not registered", 400));

  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect)
    return next(new customError("Password is incorrect", 400));

  // Now user is validated & we will send back token
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "You are logged out successfully."
    })
});

exports.forgetPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new customError("Please provide an email", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new customError("You are not registered", 400));
    }
  const forgetToken = await user.getForgetPasswordToken();
  await user.save({ validateBeforeSave: false });
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgetToken}`;
    const message = `Copy & paste the url and hit enter \n \n ${myUrl}`;
    try {
        await emailHelper({
            email: user.email,
            subject: 'T-shirt Store -- Reset Password',
            message: message
        });
        res.status(200).json({
            success: true,
            message: 'email sent'
        })
        
    } catch (error) {
        user.forgetPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new customError(error.message, 500));
    }
});

exports.resetPassword = BigPromise(async (req,res,next) => {
  const token = req.params.token;

  // we have stored encrypted token in db so we will first encrypt the token which user sent us.
  const encryptToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // we will find the user from the encrypted token and date of expiry.
  // gt means greater than & Date.now() is today's date with time.
  let user = await User.findOne({  forgetPasswordToken: encryptToken, forgotPasswordExpiry:{$gt:Date.now()}});
  if (!user)
    return next(new customError("Invalid token or token is expired", 400));

  const newPassword = req.body.password;
  if (!newPassword)
    return next(new customError("Please enter new password", 400));

  user.password = newPassword;

  user.forgetPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  user.password = undefined;
  res.status(200).json({
    success: true,
    message: "Password is reset. Please login now.",
    user,
  });
});

exports.loggedInUserDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
    if (!user)
        return next(new customError("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+password');
    const oldPassword = req.body.oldPassword;
    const isOldPasswordCorrect = await user.isValidatedPassword(oldPassword);
    if (!isOldPasswordCorrect)
        return next(new customError("Old Password is inncorrect", 400));
    
    user.password = req.body.newPassword;
    await user.save();
    cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email
    };
    if (!newData.name && newData.email)
        return next(new customError("Provide detail to update", 400));
    
    if (req.files) {
        const user = User.findById(req.user.id);
        
        // getting id of photo from DB
        const imageId = user.photo.id;

        // delete existing photo from cloudinary
        const result = await cloudinary.uploader.destroy(imageId);

        // uploaded new photo updated by user
        const imageUpload = await cloudinary.uploader.upload(
            req.files.photo.tempFilePath,
            {
                folder: "users",
                crop: "scale",
                width: 150,
            }
        );
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        user
    })
});

// this controller is for getting all users including managers & admins by admin role.
exports.adminAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
});

// this controller is for getting user by giving id by admin role.
exports.adminGetOneUser = BigPromise(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return next(new customError("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin can change or update the details of user including its role
exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
      email: req.body.email,
      role: req.body.role,
  };
  if (!newData.name && newData.email && !newData.role)
      return next(new customError("Provide details to update", 400));
    
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  if (!user) return next(new customError("User doesn't exist", 404));

    const imageId = user.photo.id;
    await cloudinary.uploader.destroy(imageId);
    await user.remove();

  res.status(200).json({
    success: true,
  });
});



// this controller is for getting all users excluding admins by manager role.
exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({role:'user'});
  res.status(200).json({
    success: true,
    users,
  });
});
