const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  // If Cloudinary is not configured, fall back to saving the file locally for development
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    // Expecting data URL: data:<mimetype>;base64,<data>
    const matches = /data:(.+);base64,(.+)/.exec(file);
    if (!matches) throw new Error("Invalid file format for local upload");

    const mime = matches[1];
    const b64 = matches[2];
    const ext = mime.split("/")[1] || "bin";
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `upload-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(b64, "base64"));

    return {
      url: `/uploads/${filename}`,
      secure_url: `/uploads/${filename}`,
      public_id: filename,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    return result;
  } catch (e) {
    console.error("Cloudinary upload failed, falling back to local save:", e);
    // Fall back to saving locally when Cloudinary fails (e.g., invalid credentials)
    const matches = /data:(.+);base64,(.+)/.exec(file);
    if (!matches) throw new Error("Invalid file format for local upload");

    const mime = matches[1];
    const b64 = matches[2];
    const ext = mime.split("/")[1] || "bin";
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `upload-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(b64, "base64"));

    return {
      url: `/uploads/${filename}`,
      secure_url: `/uploads/${filename}`,
      public_id: filename,
    };
  }
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };