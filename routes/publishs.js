const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const Publish = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");

// Publish offers
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.title.length < 51) {
      if (req.fields.description.length < 501) {
        if (req.fields.price < 100001) {
          const user = req.user;

          // Create a new offer
          const newPublish = new Publish({
            product_name: req.fields.title,
            product_description: req.fields.description,
            product_price: req.fields.price,
            product_details: [
              { MARQUE: req.fields.brand },
              { TAILLE: req.fields.size },
              { ÉTAT: req.fields.condition },
              { COULEUR: req.fields.color },
              { EMPLACEMENT: req.fields.city },
            ],
            owner: user,
          });

          // Product picture
          const productPicture = await cloudinary.uploader.upload(
            req.files.picture.path,
            {
              folder: "vinted/offers",
              public_id: `${req.fields.title} - ${newPublish._id}`,
            }
          );

          newPublish.product_image = productPicture;

          // Save the offer
          await newPublish.save();

          // Client return
          const responsePublish = {
            _id: newPublish._id,
            product_name: newPublish.product_name,
            product_description: newPublish.product_description,
            product_price: newPublish.product_price,
            product_details: newPublish.product_details,
            owner: {
              account: newPublish.owner.account,
              _id: newPublish.owner._id,
            },
            product_image: newPublish.product_image,
          };
          res.json(responsePublish);
        } else {
          res.status(400).json({ message: "Maximum price : 100 000$." });
        }
      } else {
        res.status(400).json({ message: "500 characters maximum." });
      }
    } else {
      res.status(400).json({ message: "50 characters maximum." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update offers

module.exports = router;
