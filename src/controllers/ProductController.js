
import Product from "../model/productModel.js";
import {
  // comparePassword,
  // getHashPassword,
  sendResponse,
} from "../utils/utils.js";

export const handleGetProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    sendResponse(res, 200, true, "Products fetched successfully", products);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Error fetching products");
  }
};

export const handleAddProducts = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      salePrice,
      brand,
      totalStock,
      image,
    } = req.body;

    // Ensure the user is a seller
    if (!req.userId || req.role !== "seller") {
      return sendResponse(
        res,
        403,
        false,
        "Unauthorized! Only sellers can add products."
      );
    }

    // Check required fields
    if (
      !title ||
      !price ||
      !description ||
      !category ||
      !brand ||
      !totalStock ||
      !image
    ) {
      return sendResponse(
        res,
        400,
        false,
        "All fields are required except sale price!"
      );
    }

    // Validate price and optional salePrice
    if (price < 0) {
      return sendResponse(res, 400, false, "Price must be a positive number!");
    }

    if (salePrice !== undefined && salePrice !== null) {
      if (salePrice < 0) {
        return sendResponse(
          res,
          400,
          false,
          "Sale price must be a positive number!"
        );
      }
      if (salePrice === price) {
        return sendResponse(
          res,
          400,
          false,
          "Sale price cannot be the same as the original price!"
        );
      }
    }

    // Save product to database with optional salePrice
    const savedProduct = await Product.create({
      title,
      price,
      description,
      category,
      salePrice: salePrice || undefined, // Set salePrice only if provided
      brand,
      totalStock,
      image,
      seller: req.userId, // Attach seller ID
    });

    return sendResponse(
      res,
      201,
      true,
      "Product added successfully!",
      savedProduct
    );
  } catch (error) {
    console.error("Error in handleAddProducts:", error.message);
    return sendResponse(res, 500, false, "Server error while adding product!");
  }
};

export const handleUpdateProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      title,
      price,
      description,
      category,
      salePrice,
      brand,
      totalStock,
      image,
    } = req.body;

    // Ensure the user is a seller
    if (!req.userId || req.role !== "seller") {
      return sendResponse(
        res,
        403,
        false,
        "Unauthorized! Only sellers can update products."
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found!");
    }

    // Ensure the seller updating the product is the owner
    if (product.seller.toString() !== req.userId) {
      return sendResponse(
        res,
        403,
        false,
        "Unauthorized! You can only update your own products."
      );
    }

    // Update product fields if they are provided in req.body
    product.title = title || product.title;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.salePrice = salePrice !== undefined ? salePrice : product.salePrice; // Only update salePrice if provided
    product.brand = brand || product.brand;
    product.totalStock = totalStock || product.totalStock;
    product.image = image || product.image;

    await product.save();

    return sendResponse(
      res,
      200,
      true,
      "Product updated successfully!",
      product
    );
  } catch (error) {
    console.error("Error in handleUpdateProducts:", error.message);
    return sendResponse(
      res,
      500,
      false,
      "Server error while updating product!"
    );
  }
};

export const handleDeleteProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Ensure the user is a seller
    if (!req.userId || req.role !== "seller") {
      return sendResponse(
        res,
        403,
        false,
        "Unauthorized! Only sellers can delete products."
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found!");
    }

    // Ensure the seller deleting the product is the owner
    if (product.seller.toString() !== req.userId) {
      return sendResponse(
        res,
        403,
        false,
        "Unauthorized! You can only delete your own products."
      );
    }

    // Use findByIdAndDelete instead of remove()
    await Product.findByIdAndDelete(productId);

    return sendResponse(res, 200, true, "Product deleted successfully!");
  } catch (error) {
    console.error("Error in handleDeleteProducts:", error.message);
    return sendResponse(
      res,
      500,
      false,
      "Server error while deleting product!"
    );
  }
};

export const handleGetSellerProducts = async (req, res) => {
  try {
    const sellerId = req.userId; // Assuming `verifyToken` middleware sets `req.userId`

    if (!sellerId) {
      return sendResponse(res, 400, false, "Seller ID is required!");
    }

    const products = await Product.find({ seller: sellerId });

    if (!products.length) {
      return sendResponse(
        res,
        404,
        false,
        "No products found for this seller!"
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Seller's products retrieved successfully!",
      products
    );
  } catch (error) {
    console.error("Error fetching seller products:", error.message);
    return sendResponse(
      res,
      500,
      false,
      "Server error while fetching seller products!"
    );
  }
};
