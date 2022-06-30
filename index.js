require("dotenv").config();
const app = require("./app");
const connectWithDB = require("./config/db");
const cloudinary = require("cloudinary");
const PORT = process.env.PORT || 4000;

// connection with db
connectWithDB();

// connection with cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(PORT, () => {
  console.log(`App is running @ ${process.env.PORT}`);
});
