const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// Show all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index", { allListings });
  })
);

// New listing form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/form");
});

// Create listing
router.post(
  "/",
  isLoggedIn,
  upload.array("images", 5),
  wrapAsync(async (req, res) => {
    const listing = new Listing(req.body);

    // Add owner
    listing.owner = req.user._id;

    // Add uploaded images
    listing.images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    await listing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/editform", { listing });
  })
);

// Update listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.array("images", 5),
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // If new images uploaded
    if (req.files.length) {
      listing.images.push(
        ...req.files.map((file) => ({
          url: file.path,
          filename: file.filename,
        }))
      );
    }

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  })
);

// Show a single listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");

    res.render("listings/show", { listing });
  })
);

// Delete listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
