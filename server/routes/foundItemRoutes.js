const express = require("express");
const multer = require("multer");

const {
  createFoundItem,
  getFoundItems,
} = require("../controllers/foundItemController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/",
  protect,
  upload.single("image"),
  createFoundItem
);

router.get("/", protect, getFoundItems);

module.exports = router;