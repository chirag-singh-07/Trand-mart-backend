import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Buyer
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Ordered Product
        quantity: Number,
      },
    ],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }, // Seller who owns the product
    totalAmount: Number,
    status: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
