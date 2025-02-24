import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price; // salePrice should be less than price
        },
        message: "Sale price must be less than the original price.",
      },
    },
    category: { type: String, required: true },
    brand: { type: String },
    totalStock: { type: Number, required: true },
    image: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    }, // Linked to Seller
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: {
          type: Number,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating must be at most 5"],
        },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field for average rating
ProductSchema.virtual("averageRating").get(function () {
  if (this.ratings.length > 0) {
    return (
      this.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
      this.ratings.length
    );
  }
  return 0;
});

// Ensure virtuals are included when converting to JSON or Objects
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", ProductSchema);

export default Product;
