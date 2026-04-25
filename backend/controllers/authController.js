const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");

function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.registerStudent = async (req, res) => {
  try {
    const { fullName, matricNumber, department, level, email, password } = req.body;

    if (!fullName || !matricNumber || !department || !level || !password) {
      return res.status(400).json({
        message: "Please provide full name, matric number, department, level, and password.",
      });
    }

    const existingStudent = await Student.findOne({
      matricNumber: matricNumber.toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this matric number already exists.",
      });
    }

    if (email) {
      const existingEmail = await Student.findOne({
        email: email.toLowerCase(),
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "A student with this email already exists.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      fullName,
      matricNumber: matricNumber.toUpperCase(),
      department,
      level,
      email: email ? email.toLowerCase() : "",
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Student registered successfully.",
      student: {
        id: student._id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Student registration failed.",
      error: error.message,
    });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { matricNumber, password } = req.body;

    if (!matricNumber || !password) {
      return res.status(400).json({
        message: "Please provide matric number and password.",
      });
    }

    const student = await Student.findOne({
      matricNumber: matricNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid matric number or password.",
      });
    }

    const token = createToken({
      id: student._id,
      role: student.role,
      matricNumber: student.matricNumber,
    });

    res.status(200).json({
      message: "Student access granted.",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Student login failed.",
      error: error.message,
    });
  }
};

exports.registerLecturer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please provide full name, email, and password.",
      });
    }

    const existingLecturer = await Lecturer.findOne({
      email: email.toLowerCase(),
    });

    if (existingLecturer) {
      return res.status(400).json({
        message: "A lecturer with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lecturer = await Lecturer.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Lecturer registered successfully.",
      lecturer: {
        id: lecturer._id,
        fullName: lecturer.fullName,
        email: lecturer.email,
        role: lecturer.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lecturer registration failed.",
      error: error.message,
    });
  }
};

exports.loginLecturer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    const lecturer = await Lecturer.findOne({
      email: email.toLowerCase(),
    });

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer account not found.",
      });
    }

    const isMatch = await bcrypt.compare(password, lecturer.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken({
      id: lecturer._id,
      role: lecturer.role,
      email: lecturer.email,
    });

    res.status(200).json({
      message: "Lecturer login successful.",
      token,
      lecturer: {
        id: lecturer._id,
        fullName: lecturer.fullName,
        email: lecturer.email,
        role: lecturer.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lecturer login failed.",
      error: error.message,
    });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const { fullName, matricNumber, department, level } = req.body;

    if (!fullName && !matricNumber && !department && !level) {
      return res.status(400).json({
        message: "Provide at least one profile field to update."
      });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    if (matricNumber && matricNumber.toUpperCase() !== student.matricNumber) {
      const existingStudent = await Student.findOne({
        matricNumber: matricNumber.toUpperCase(),
        _id: { $ne: student._id }
      });

      if (existingStudent) {
        return res.status(400).json({
          message: "A student with this matric number already exists."
        });
      }
    }

    if (fullName) student.fullName = fullName.trim();
    if (matricNumber) student.matricNumber = matricNumber.toUpperCase().trim();
    if (department) student.department = department.trim();
    if (level) student.level = level;

    await student.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      token: createToken({
        id: student._id,
        role: student.role,
        matricNumber: student.matricNumber,
      }),
      student: {
        id: student._id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        email: student.email,
        role: student.role,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile.",
      error: error.message
    });
  }
};

exports.updateLecturerProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
      return res.status(400).json({
        message: "Provide at least one profile field to update."
      });
    }

    const lecturer = await Lecturer.findById(req.user.id);

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found."
      });
    }

    if (email && email.toLowerCase() !== lecturer.email) {
      const existingLecturer = await Lecturer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: lecturer._id }
      });

      if (existingLecturer) {
        return res.status(400).json({
          message: "A lecturer with this email already exists."
        });
      }
    }

    if (fullName) lecturer.fullName = fullName.trim();
    if (email) lecturer.email = email.toLowerCase().trim();

    await lecturer.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      token: createToken({
        id: lecturer._id,
        role: lecturer.role,
        email: lecturer.email,
      }),
      lecturer: {
        id: lecturer._id,
        fullName: lecturer.fullName,
        email: lecturer.email,
        role: lecturer.role,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update lecturer profile.",
      error: error.message
    });
  }
};

exports.resetStudentPassword = async (req, res) => {
  try {
    const { matricNumber, newPassword } = req.body;

    if (!matricNumber || !newPassword) {
      return res.status(400).json({
        message: "Matric number and new password are required."
      });
    }

    const student = await Student.findOne({
      matricNumber: matricNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    await student.save();

    res.status(200).json({
      message: "Student password reset successful."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset student password.",
      error: error.message
    });
  }
};

/* ✅ ONLY ONE VERSION NOW (FIXED) */
exports.resetLecturerPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required."
      });
    }

    const lecturer = await Lecturer.findOne({
      email: email.toLowerCase()
    });

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    lecturer.password = hashedPassword;
    await lecturer.save();

    res.status(200).json({
      message: "Lecturer password reset successful."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset lecturer password.",
      error: error.message
    });
  }
};
