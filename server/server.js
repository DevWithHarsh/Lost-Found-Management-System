const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Lost & Found API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use(
  "/api/found-items",
  require("./routes/foundItemRoutes")
);
app.use(
  "/api/claims",
  require("./routes/claimRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});