const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const JWT_SECRET = require('../../config/global').JWT_SECRET;

// @route    POST api/users
// @desc     Register user
// @access   public

router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please, include a valid email').isEmail(),
    check('password', 'Password must contains at least 6 symbols').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists

      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      // Get users gravatar

      const avatar = await gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'identicon'
      });

      // Encrypt password

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, avatar, password: encryptedPassword });
      await user.save();

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
      console.error(error.message);
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
