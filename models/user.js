const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [40, "Name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "this isn't an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be atleast more than 6 characters"],
    select: false, // password will not be selected or If needed it has be explicity selected
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
     required: true
    },
    secure_url: {
      type: String,
      required: true
    },
  },
  forgetPasswordToken: String,
  forgetPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// In createdAt we have added default to add date "Date.now" instead of "Date.now()" because we don't want to execute it immediately instead.  

// Pre hooks
// encrypting password before saving it
userSchema.pre("save", async function (next) {
    // Check password is modified and if yes then encrypt it
    if (!this.isModified('password')) return next(); 
    this.password = await bcrypt.hash(this.password, 10);
});
  
// validate the password with the passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
    return await bcrypt.compare(userSendPassword, this.password);
} 
 
// create & return JWT token
userSchema.methods.getJwtToken = async function () {
    const token = await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    }); 
  return token;
}

// generate forget password token (String)
userSchema.methods.getForgetPasswordToken = async function () {
  // generate a random string
  const forgetToken = await crypto.randomBytes(20).toString("hex");

  // getting a hash - make sure to get a hash bcoz we need to save it in DB
  // once we get the forget token from user we will convert it in hash and compare it with this alread stored hased token
  this.forgetPasswordToken = await crypto
    .createHash("sha256")
    .update(forgetToken)
    .digest("hex");

  // time of token
  this.forgetPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return forgetToken;
}


module.exports = mongoose.model('User', userSchema);
