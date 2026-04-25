const express = require("express");
const {
  submitAttendance,
  heartbeat,
  updateAttendanceStatus,
  getSessionAttendance,
  getStudentSessionAttendance,
  getLecturerAttendanceSummary
} = require("../controllers/attendanceController");
const { protect, lecturerOnly, studentOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit", protect, studentOnly, submitAttendance);
router.post("/heartbeat", protect, studentOnly, heartbeat);
router.patch("/status/:attendanceId", protect, updateAttendanceStatus);
router.get("/session/:sessionId", protect, lecturerOnly, getSessionAttendance);
router.get("/student/:sessionId/:matricNumber", protect, getStudentSessionAttendance);
router.get("/summary/:sessionId", protect, lecturerOnly, getLecturerAttendanceSummary);

module.exports = router;
