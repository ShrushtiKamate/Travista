const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

// CREATE REVIEW
router.post(
  "/reviews",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const listing = await Listing.findById(id);

    const review = new Review({
      rating,
      comment,
      author: req.user._id,
      listing: id,
    });

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE REVIEW
router.delete(
  "/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Review.findByIdAndDelete(reviewId);

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
