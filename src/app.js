const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

dotenv.config();
const authRouter = require("./routes/auth.route");

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", authRouter);

const port = process.env.PORT || 5000;

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Database connected...");

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
  });
};

connect();
