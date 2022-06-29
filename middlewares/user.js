const BigPromise = require('./bigPromise');
const User = require('../models/user');
const customError = require('../utils/customErrors');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token)
        return next(new customError('You are not logged in', 401));
    
    // decoded will verfy the token 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // we created user property in req object and add info of the user
    req.user = await User.findById(decoded.id);
    next();
});

exports.customRole = (...roles) => {

    // Here we don't need BigPromise as we are not handling any error
    // next() is available because customRole is a middleware.
    return (req, res, next) => {
        
        //roles is an array '[admin]' and includes will check if (req.user.role) exist or not?...which means req.user.role is not admin then if part will run
        if (!roles.includes(req.user.role)) {
            
            return next(new customError("Request forbidden. Check your role", 401));
        }
        next();
    }
}