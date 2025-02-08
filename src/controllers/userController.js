import { sendVerificationEmail } from "../mailtrap/emails.js";
import User from "../model/UserModel.js";
import { genrateTokenAndSetToken } from "../utils/token.js";
import { sendResponse, getHashPassword } from "../utils/utils.js";
import { generateVerificationCode } from "../utils/verification.js";

export const handleRegisterUser = async (req, res) => {
  // Your code here
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return sendResponse(res, 400, false, "Missing required fields", null);
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long",
        null
      );
    }

    const userAlreadyExits = await User.findOne({ email });

    if (userAlreadyExits) {
      return sendResponse(res, 400, false, "Email already exists", null);
    }

    const hashedPassword = getHashPassword(password);

    const verificationToken = generateVerificationCode();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });
    await newUser.save();

    genrateTokenAndSetToken(res, newUser._id, newUser.role);

    await sendVerificationEmail(newUser.email, verificationToken);

    const user = {
      ...newUser._doc,
      password: null, // Don't send password in response
    };

    return sendResponse(res, 201, true, "User registered successfully", user);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Internal server error", false);
  }
};

export const handleLoginUser = async (req, res) => {
  // Your code here
};

export const handleLogoutUser = async (req, res) => {
  // Your code here
};
