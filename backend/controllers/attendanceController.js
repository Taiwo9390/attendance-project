const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Student = require("../models/Student");

exports.submitAttendance = async (req, res) => {
  try {
    const { sessionCode, matricNumber } = req.body;

    if (!sessionCode || !matricNumber) {
      return res.status(400).json({
        message: "Please provide session code and matric number."
      });
    }

    if (req.user.matricNumber !== matricNumber.toUpperCase()) {
      return res.status(403).json({
        message: "You can only submit attendance for your own student account."
      });
    }

    const session = await Session.findOne({
      sessionCode: sessionCode.toUpperCase()
    });

    if (!session) {
      return res.status(404).json({
        message: "No session found with this code."
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        message: "This session is no longer active."
      });
    }

    if (new Date() > session.expiresAt) {
      session.status = "expired";
      await session.save();

      return res.status(400).json({
        message: "This session has expired."
      });
    }

    const student = await Student.findOne({
      matricNumber: matricNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found."
      });
    }

    const existingAttendance = await Attendance.findOne({
      sessionId: session._id,
      studentId: student._id
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "You have already submitted attendance for this session.",
        attendance: existingAttendance
      });
    }

    const attendance = await Attendance.create({
      sessionId: session._id,
      lecturerId: session.lecturerId,
      studentId: student._id,
      studentName: student.fullName,
      matricNumber: student.matricNumber,
      department: student.department,
      level: student.level,
      status: "Pending",
      submittedAt: new Date()
    });

    res.status(201).json({
      message: "Attendance submitted successfully.",
      attendance,
      session: {
        id: session._id,
        courseCode: session.courseCode,
        courseTitle: session.courseTitle,
        sessionNumber: session.sessionNumber,
        sessionCode: session.sessionCode,
        duration: session.duration,
        expiresAt: session.expiresAt,
        status: session.status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit attendance.",
      error: error.message
    });
  }
};

exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Confirmed", "Incomplete", "Expired"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status."
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found."
      });
    }

    if (String(attendance.lecturerId) !== req.user.id && 
        String(attendance.studentId) !== req.user.id
       )
       {
      return res.status(403).json({
        message: "You are not allowed to update this attendance record."
      });
    }


    attendance.status = status;
    await attendance.save();

    res.status(200).json({
      message: "Attendance status updated successfully.",
      attendance
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update attendance status.",
      error: error.message
    });
  }
};

exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found."
      });
    }

    if (String(session.lecturerId) !== req.user.id) {
      return res.status(403).json({
        message: "You can only view attendance for your own session."
      });
    }

    const attendanceRecords = await Attendance.find({ sessionId }).sort({
      submittedAt: 1
    });

    res.status(200).json({
      message: "Attendance records fetched successfully.",
      attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance records.",
      error: error.message
    });
  }
};

exports.getStudentSessionAttendance = async (req, res) => {
  try {
    const { sessionId, matricNumber } = req.params;

    const student = await Student.findOne({
      matricNumber: matricNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found."
      });
    }

    if (
      req.user.role === "student" &&
      req.user.matricNumber !== matricNumber.toUpperCase()
    ) {
      return res.status(403).json({
        message: "You can only view your own attendance record."
      });
    }

    const attendance = await Attendance.findOne({
      sessionId,
      studentId: student._id
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found for this student and session."
      });
    }

    res.status(200).json({
      message: "Student attendance fetched successfully.",
      attendance
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student attendance.",
      error: error.message
    });
  }
};

exports.getLecturerAttendanceSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found."
      });
    }

    if (String(session.lecturerId) !== req.user.id) {
      return res.status(403).json({
        message: "You can only view summary for your own session."
      });
    }

    const attendanceRecords = await Attendance.find({ sessionId });

    const confirmed = attendanceRecords.filter(
      (record) => record.status === "Confirmed"
    ).length;

    const incomplete = attendanceRecords.filter(
      (record) => record.status === "Incomplete"
    ).length;

    const expired = attendanceRecords.filter(
      (record) => record.status === "Expired"
    ).length;

    const pending = attendanceRecords.filter(
      (record) => record.status === "Pending"
    ).length;

    const total = attendanceRecords.length;

    res.status(200).json({
      message: "Attendance summary fetched successfully.",
      summary: {
        total,
        confirmed,
        incomplete,
        expired,
        pending
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance summary.",
      error: error.message
    });
  }
};