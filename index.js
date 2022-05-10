require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(morgan("dev"));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/users");
app.use(userRoutes);

const publishRoutes = require("./routes/publishs");
app.use(publishRoutes);

const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

app.all("*", (req, res) => {
  res.status(400).json("Page introuvable");
});

app.listen(process.env.PORT, () => {
  console.log("Serveur has started");
});

// app.listen(4000, () => {
//   console.log("Serveur has started");
// });
