import mongoose from "mongoose";
import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import { sendResponse } from "../utils/utils.js";
import User from "../model/userModel.js";

export const handleAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "User not authenticated. Please login to add to cart."
      );
    }

    const { productId, quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, 400, false, "Invalid product ID.");
    }

    // Validate quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return sendResponse(
        res,
        400,
        false,
        "Quantity must be a positive integer."
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found.");
    }

    // Check stock availability
    if (product.totalStock < quantity) {
      return sendResponse(
        res,
        400,
        false,
        `Only ${product.totalStock} items left in stock.`
      );
    }

    // Find the user's cart or create a new one if not found
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
      await cart.save();

      // Link the cart to the user
      await User.findByIdAndUpdate(userId, { cart: cart._id });
    } else {
      // Check if the product already exists in the cart
      const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex === -1) {
        // Add new product to cart
        cart.items.push({ productId, quantity });
      } else {
        // Update quantity of existing product
        cart.items[productIndex].quantity += quantity;
      }

      await cart.save();
    }

    return sendResponse(res, 200, true, "Product added to cart successfully.");
  } catch (error) {
    console.error("Error in add to cart function:", error);
    return sendResponse(
      res,
      500,
      false,
      "Server error while adding product to cart!",
      error.message
    );
  }
};

export const handleFetchCartItems = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "User not authenticated. Please login to view cart."
      );
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice brand category",
    });

    if (!cart) {
      return sendResponse(res, 200, true, "Cart is empty.", { items: [] });
    }

    // Filter out invalid/missing product references
    const validItems = cart.items.filter((item) => item.productId !== null);

    // If invalid items were removed, update the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Map items into a clean response format
    const cartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      brand: item.productId.brand,
      category: item.productId.category,
      quantity: item.quantity,
    }));

    return sendResponse(res, 200, true, "Cart items fetched successfully.", {
      items: cartItems,
    });
  } catch (error) {
    console.error("Error in fetch cart items function:", error);
    return sendResponse(
      res,
      500,
      false,
      "Server error while fetching cart items!",
      error.message
    );
  }
};

export const handleUpdateCartQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "User not authenticated. Please login to update cart."
      );
    }

    const { productId, quantity } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, 400, false, "Invalid product ID.");
    }

    // Validate quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return sendResponse(
        res,
        400,
        false,
        "Quantity must be a positive integer."
      );
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      return sendResponse(res, 404, false, "Cart not found or empty.");
    }

    // Find the product in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.productId && item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return sendResponse(res, 404, false, "Product not found in cart.");
    }

    // Update quantity
    cart.items[productIndex].quantity = quantity;
    await cart.save();

    // Populate cart items with product details
    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice brand category",
    });

    // Transform cart items
    const cartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : null,
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      brand: item.productId ? item.productId.brand : null,
      category: item.productId ? item.productId.category : null,
      quantity: item.quantity,
    }));

    return sendResponse(
      res,
      200,
      true,
      "Cart quantity updated successfully.",
      cartItems
    );
  } catch (error) {
    console.error("Error in update cart quantity function:", error);
    return sendResponse(
      res,
      500,
      false,
      "Server error while updating cart quantity!",
      error.message
    );
  }
};

export const handleDeleteProductItems = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "User not authenticated. Please login to delete items from cart."
      );
    }

    const { productId } = req.params; // Ensure your route is set correctly in Express

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, 400, false, "Invalid product ID.");
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      return sendResponse(res, 404, false, "Cart not found or empty.");
    }

    // Find the product in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.productId && item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return sendResponse(res, 404, false, "Product not found in cart.");
    }

    // Remove the product from the cart
    cart.items.splice(productIndex, 1);

    // If cart is empty after deletion, remove the cart from the database
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ userId });
      return sendResponse(
        res,
        200,
        true,
        "Product removed. Cart is now empty.",
        []
      );
    }

    // Save updated cart
    await cart.save();

    // Populate cart items with product details
    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice brand category",
    });

    // Transform cart items
    const cartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : null,
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      brand: item.productId ? item.productId.brand : null,
      category: item.productId ? item.productId.category : null,
      quantity: item.quantity,
    }));

    return sendResponse(
      res,
      200,
      true,
      "Product deleted from cart successfully.",
      cartItems
    );
  } catch (error) {
    console.error("Error in delete cart items function:", error);
    return sendResponse(
      res,
      500,
      false,
      "Server error while deleting cart items!",
      error.message
    );
  }
};
