const express = require("express");
const Offer = require("../models/Offer");
const router = express.Router();

// Offer by filters
router.get("/offers", async (req, res) => {
  try {
    // Limit by page
    // let limit = 15;
    // if (req.query.limit) {
    //   limit = req.query.limit;
    // }
    // Page
    // let page = 1;
    // if (req.query.page) {
    //   page = req.query.page;
    // }

    // All filters
    const filter = {};
    console.log(req.query);
    // If I enter an object name
    if (req.query.product_name) {
      filter.product_name = new RegExp(req.query.product_name, "i");
    }
    // If I set a minimum price
    if (req.query.priceMin) {
      filter.product_price = {
        $gte: req.query.priceMin,
      };
    }
    // If I set a maximum price
    if (req.query.priceMax) {
      filter.product_price = {
        $lte: req.query.priceMax,
      };
    }
    // If I set minimum and maximum price
    if (req.query.priceMin && req.query.priceMax) {
      filter.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }

    // If I want to sort by price
    if (req.query.product_price) {
      const offer = await Offer.find(filter)
        .sort({ product_price: req.query.product_price })
        .limit(limit)
        .skip(limit * page - limit);

      if (offer.length > 0) {
        const count = await Offer.countDocuments(filter);
        res.status(200).json({ count: count, offers: offer });
      } else {
        res.status(400).json({ message: "No products found." });
      }

      // Or if I don't want
    } else {
      const offer = await Offer.find(filter)
        .limit(limit)
        .skip(limit * page - limit);

      if (offer.length > 0) {
        const count = await Offer.countDocuments(filter);
        res.status(200).json({ count: count, offers: offer });
      } else {
        res.status(400).json({ message: "No products found." });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Offer by id
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    if (offer) {
      res.status(400).json(offer);
    } else {
      res.status(400).json({ message: "No products found." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
