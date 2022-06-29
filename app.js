require('dotenv').config();
const { urlencoded } = require('express');
const express = require('express')
const app = express();
const  morgan = require('morgan');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

// For swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middlewares
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.set("view engine", "ejs"); // To use ejs template

// cookies & file middlewares
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Inject middleware morgan logger 
app.use(morgan("tiny"));

//imported all routes
const home = require('./routes/home')
const user = require('./routes/user');
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");

//imported router middleware
app.use('/api/v1', home)
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

// temp test route for form
app.get('/signUpForm', (req,res) => {
    res.render('postForm')
})

// export app.js
module.exports = app;