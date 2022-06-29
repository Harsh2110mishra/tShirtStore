const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

const connectWithDB = () => {
  mongoose
    .connect(MONGODB_URL, {
      // use these connection options as it is recommended

      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB CONNECTION ESTABILISED SUCCESSFULLY"))
    .catch((err) => {
      console.log("DB CONNECTION FAILED, ERROR:", err);
      process.exit(1);
    });
};

module.exports = connectWithDB;

