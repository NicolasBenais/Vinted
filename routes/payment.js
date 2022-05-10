const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/payment", async (req, res) => {
  try {
    const stripeToken = req.fields.stripeToken;
    const totalPrice = req.fields.totalPrice;
    const productName = req.fields.title;

    const response = await stripe.charges.create({
      amount: totalPrice * 100,
      currency: "eur",
      description: productName,
      source: stripeToken,
    });
    console.log(response.status);
    res.json(response);
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
});

module.exports = router;
