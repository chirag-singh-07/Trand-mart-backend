import Admin from "../model/AdminModel.js";
import { genrateTokenAndSetToken } from "../utils/token.js";
import {
  comparePassword,
  getHashPassword,
  sendResponse,
} from "../utils/utils.js";

export const handleVerifyCheckAuthAdmin = async (req, res) => {
  const userId = req.userId; // Directly access it instead of destructuring

  try {
    if (!userId) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    const admin = await Admin.findById(userId).select("-password");

    if (!admin) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    sendResponse(res, 200, true, "Authenticated", admin);
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const handleRegsiterAdmin = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide all the required fields"
      );
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long"
      );
    }

    // Check if email already exists
    const admin = await Admin.findOne({ email });
    if (admin) {
      return sendResponse(res, 400, false, "Email already exists");
    }

    const hashedPassword = getHashPassword(password);

    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
    });

    genrateTokenAndSetToken(res, newAdmin._id);

    await newAdmin.save();

    sendResponse(res, 201, true, "Admin user created successfully", newAdmin);
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 400, false, "Server error on the create the admin user");
  }
};

export const handleLoginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide all the required fields"
      );
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long"
      );
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
      return sendResponse(res, 401, false, "Invalid credentials or password");
    }

    genrateTokenAndSetToken(res, admin._id);

    const { password, ...adminData } = admin._doc;
    sendResponse(
      res,
      200,
      true,
      "Admin user logged in successfully",
      adminData
    );
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server error on the login");
  }
};

export const handleLogoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    sendResponse(res, 200, true, "Admin user logged out successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server error on the logout");
  }
};
