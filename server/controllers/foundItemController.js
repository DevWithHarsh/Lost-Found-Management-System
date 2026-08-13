const FoundItem = require("../models/FoundItem");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
// =========================
// CREATE FOUND ITEM
// =========================
const createFoundItem = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      location,
      foundDate,
    } = req.body;

    if (
      !name ||
      !category ||
      !description ||
      !location ||
      !foundDate
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "lost-and-found",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);
        });
      };

      const result = await uploadToCloudinary();

      imageUrl = result.secure_url;
    }

    const item = await FoundItem.create({
      name,
      category,
      description,
      location,
      foundDate,
      image: imageUrl,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      message: "Found item reported successfully",
      item,
    });
  } catch (error) {
    console.error("Create found item error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// GET ALL FOUND ITEMS
// =========================
const getFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      items,
    });
  } catch (error) {
    console.error("Get found items error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
};