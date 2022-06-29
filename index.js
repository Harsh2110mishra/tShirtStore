const app = require('./app');
const connectWithDB = require('./config/db');
const cloudinary = require('cloudinary');

// connection with db
connectWithDB();

// connection with cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(process.env.PORT,() => {
    console.log(`App is running @ ${process.env.PORT}`);
})