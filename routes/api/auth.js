const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const JWT_SECRET = require('../../config/global').JWT_SECRET;
const authMiddleware = require('../../middleware/auth');
const User = require('../../models/User');

const router = express.Router();

// @route    GET api/auth
// @desc     Auth route
// @access   protected

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json({ user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});

// @route    POST api/auth
// @desc     Authenticate user and get token
// @access   public

router.post(
  '/',
  [
    check('email', 'Please, include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists

      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      // Return JWT

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (error, token) => {
        if (error) {
          throw error;
        }
        return res.json({ token });
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
