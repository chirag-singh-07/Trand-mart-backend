import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const imageUploadUitls = async (file) => {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return res;
};

const upload = multer({ storage });

export { upload, imageUploadUitls };
