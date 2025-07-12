const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Połączono z MongoDB");
  } catch (err) {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
