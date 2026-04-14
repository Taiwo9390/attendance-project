const express = require("express");
const {
  createSession,
  getActiveSession,
  endSession,
  getLecturerSessions,
  getSessionByCode
} = require("../controllers/sessionController");
const { protect, lecturerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, lecturerOnly, createSession);
router.get("/active/:lecturerId", protect, lecturerOnly, getActiveSession);
router.patch("/end/:sessionId", protect, lecturerOnly, endSession);
router.get("/lecturer/:lecturerId", protect, lecturerOnly, getLecturerSessions);

/* students and lecturers may both need this */
router.get("/code/:sessionCode", protect, getSessionByCode);

module.exports = router;