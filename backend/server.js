const attendanceRoutes = require("./routes/attendanceRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

connectDB();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://YOUR-NETLIFY-SITE.netlify.app"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AttendSure backend is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
});