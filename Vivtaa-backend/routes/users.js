var express = require('express');
var router = express.Router();
const user = require('../schema/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../components/jwtTokenDetails');

const generateRefreshToken = (user, payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '7d',
      jwtid: `refresh-token-${payload.id}`
    });  // 7 days expiry
};

const generateAccessToken = (user, payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
      jwtid: `access-token-${Date.now()}`
    });  // 1 hour expiry
};

//user register api
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email already have
    const checkEmail = await user.findOne({ email: email });
    if (checkEmail !== null) {
      return res.status(400).json({
        status: 400,
        message: 'Email already have, give a anther email'
      });
    }

    // hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // create user
    const createUser = new user({
      email,
      password: hashPassword
    });
    await createUser.save();

    res.status(201).json({
      status: 201,
      message: 'User created successfully',
      data: {email:createUser.email}
    });

  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
});

//user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: 'email or password is missing. kindly fill the missing filed'
      });
    }

    //check the email and password
    const checkEmail = await user.findOne({ email: email });
    const passwordMatch = await bcrypt.compare(password, checkEmail.password);

    if (!passwordMatch) {
      return res.status(400).json({
        status: 400,
        message: 'password not match'
      });
    }

    const payload = { email: checkEmail.email, id:checkEmail._id };
    const accessToken = generateAccessToken(user, payload);
    const refreshToken = generateRefreshToken(user, payload);

    res.status(200).json({
      status: 200,
      message: 'Login Successfully',
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// user logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken, accessToken } = req.body;

    const decodedAccessToken = jwt.decode(accessToken);
    const decodedRefreshToken = jwt.decode(refreshToken);
    console.log('decodedAccessToken', decodedAccessToken);

    if(!decodedAccessToken || !decodedRefreshToken) {
      return res.status(400).json({
        status:400,
        message:'Unable to logout, try again'
      });
    }

    if (decodedAccessToken && decodedAccessToken.jti) {
      blacklistToken(decodedAccessToken.jti);
    }

    // if (decodedRefreshToken && decodedRefreshToken.jti) {
    //   blacklistToken(decodedRefreshToken.jti);
    // }

    return res.status(200).json({
      status: 200,
      message: 'Logout successfully',
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
