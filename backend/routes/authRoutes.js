const express = require("express");
const { protect, studentOnly } = require("../middleware/authMiddleware");
const {
  registerStudent,
  loginStudent,
  registerLecturer,
  loginLecturer,
  updateStudentProfile,
  resetStudentPassword,
  resetLecturerPassword
} = require("../controllers/authController");

const router = express.Router();

router.post("/students/register", registerStudent);
router.post("/students/login", loginStudent);
router.patch("/students/update", protect, studentOnly, updateStudentProfile);
router.post("/students/reset-password", resetStudentPassword);

router.post("/lecturers/register", registerLecturer);
router.post("/lecturers/login", loginLecturer);
router.post("/lecturers/reset-password", resetLecturerPassword);

module.exports = router;