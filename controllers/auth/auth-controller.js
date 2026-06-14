const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User");

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // Ensure mongoose is connected (quick connect to avoid buffering timeouts)
    if (mongoose.connection.readyState !== 1) {
      try {
        await Promise.race([
          mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('MongoDB connect timeout')), 8000)),
        ]);
      } catch (connErr) {
        console.error('DB connect error in registerUser:', connErr.message || connErr);
        return res.status(500).json({ success: false, message: connErr.message || 'Database connection error' });
      }
    }
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.error('Register Error:', e);
    if (e && e.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const message = e && e.message ? e.message : 'Some error occured';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure mongoose is connected before DB operations
    if (mongoose.connection.readyState !== 1) {
      try {
        await Promise.race([
          mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('MongoDB connect timeout')), 8000)),
        ]);
      } catch (connErr) {
        console.error('DB connect error in loginUser:', connErr.message || connErr);
        return res.status(500).json({ success: false, message: connErr.message || 'Database connection error' });
      }
    }
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };