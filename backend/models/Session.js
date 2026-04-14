const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    lecturerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    sessionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    topic: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "ended", "expired"],
      default: "active",
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);