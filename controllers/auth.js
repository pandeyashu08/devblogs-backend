const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwtHelper = require("../utils/jwtHelper");

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findOne({ email });
    // TODO : verify user
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    const token = jwtHelper.createToken({ email: user.email });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const findUser=await User.findOne({email});
    if(findUser){
      return res.status(403).json({message:"User Already exists"})
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      console.error("Error hashing password:", error);
      return res.status(500).json({ message: "Error hashing password" });
    }

    const newUser=new User({
      email,
      password:hashedPassword
    })
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyTokenHandler = (req, res) => {
  const token = req.body.token || req.headers["authorization"];
  
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = jwtHelper.verifyToken(token);
    return res.status(200).json({ message: "Token is valid", decoded });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  loginHandler,
  registerHandler,
  verifyTokenHandler,
};
