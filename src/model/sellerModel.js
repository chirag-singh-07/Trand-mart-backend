import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      // required: true,
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
    storeName: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      country: String,
      postalCode: String,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // References the Product collection
      },
    ],
    totalSales: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin can verify the seller
    },
    role: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "seller",
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model("Seller", SellerSchema);

export default Seller;
