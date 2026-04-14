const Session = require("../models/Session");

function generateSessionCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

async function generateUniqueSessionCode() {
  let code;
  let exists = true;

  while (exists) {
    code = generateSessionCode();
    const existingSession = await Session.findOne({ sessionCode: code });
    if (!existingSession) exists = false;
  }

  return code;
}

exports.createSession = async (req, res) => {
  try {
    const {
      lecturerId,
      lecturerEmail,
      courseCode,
      courseTitle,
      sessionNumber,
      duration,
      topic
    } = req.body;

    if (!lecturerId || !lecturerEmail || !courseCode || !courseTitle || !sessionNumber) {
      return res.status(400).json({
        message: "Please provide lecturer, course code, course title, and session number."
      });
    }

    if (req.user.id !== lecturerId || req.user.email !== lecturerEmail.toLowerCase()) {
      return res.status(403).json({
        message: "You can only create sessions for your own lecturer account."
      });
    }

    const existingActiveSession = await Session.findOne({
      lecturerId,
      status: "active"
    });

    if (existingActiveSession) {
      return res.status(400).json({
        message: "You already have an active session. End it before creating another one."
      });
    }

    const sessionCode = await generateUniqueSessionCode();
    const durationInSeconds = Number(duration) || 60;
    const startsAt = new Date();
    const expiresAt = new Date(Date.now() + durationInSeconds * 1000);

    const session = await Session.create({
      lecturerId,
      lecturerEmail,
      courseCode: courseCode.toUpperCase(),
      courseTitle,
      sessionNumber,
      sessionCode,
      duration: durationInSeconds,
      topic: topic || "",
      startsAt,
      expiresAt,
      status: "active"
    });

    res.status(201).json({
      message: "Session created successfully.",
      session
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create session.",
      error: error.message
    });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    if (req.user.id !== lecturerId) {
      return res.status(403).json({
        message: "You can only view your own active session."
      });
    }

    const session = await Session.findOne({
      lecturerId,
      status: "active"
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({
        message: "No active session found."
      });
    }

    if (new Date() > session.expiresAt && session.status === "active") {
      session.status = "expired";
      await session.save();
    }

    res.status(200).json({
      message: "Active session fetched successfully.",
      session
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch active session.",
      error: error.message
    });
  }
};

exports.endSession = async (req, res) => {
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
        message: "You can only end your own session."
      });
    }

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({
      message: "Session ended successfully.",
      session
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to end session.",
      error: error.message
    });
  }
};

exports.getLecturerSessions = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    if (req.user.id !== lecturerId) {
      return res.status(403).json({
        message: "You can only view your own sessions."
      });
    }

    const sessions = await Session.find({ lecturerId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lecturer sessions fetched successfully.",
      sessions
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lecturer sessions.",
      error: error.message
    });
  }
};

exports.getSessionByCode = async (req, res) => {
  try {
    const { sessionCode } = req.params;

    const session = await Session.findOne({
      sessionCode: sessionCode.toUpperCase()
    });

    if (!session) {
      return res.status(404).json({
        message: "No session found with this code."
      });
    }

    if (session.status !== "active" || new Date() > session.expiresAt) {
      if (session.status === "active" && new Date() > session.expiresAt) {
        session.status = "expired";
        await session.save();
      }

      return res.status(400).json({
        message: "This session is no longer active."
      });
    }

    res.status(200).json({
      message: "Session found.",
      session
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch session.",
      error: error.message
    });
  }
};