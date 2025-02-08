import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    role: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer",
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      default: null,
    },
    orders: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    address: {
      addressLine1: {
        type: String,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      postalCode: {
        type: String,
      },
    },
    profilePic: {
      type: String,
      default: "",
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    phone: { type: String, default: "" },
    trandCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User",UserSchema);

export default User;