const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // WHO wrote this review?
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // WHICH LISTING does this review belong to?
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
