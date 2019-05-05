const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator/check');

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
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('Users route');
  }
);

module.exports = router;
