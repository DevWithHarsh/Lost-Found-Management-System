const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Allow the deployed frontend and local development
const allowedOrigins = [
  "https://lost-found-management-system-n63x.vercel.app",
  "https://lost-found-management-system-n63x-b1k86l33t.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-side tools
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options(/.*/, cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Lost & Found API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/found-items", require("./routes/foundItemRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));

// Connect to MongoDB before handling requests.
// Keep your existing connection function for now.
connectDB();

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;