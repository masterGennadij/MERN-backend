const express = require('express');
const { check, validationResult } = require('express-validator/check');

const authMiddleware = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

// @route    GET api/profile/me
// @desc     Get current user's profile
// @access   Private

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
      'name',
      'avatar'
    ]);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route    POST api/profile/me
// @desc     Create or update user profile
// @access   Private

router.post(
  '/',
  [
    authMiddleware,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    // Build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build profile social object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create profile

      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    if (!profiles) {
      return res.status(400).json({ msg: 'There is no profiles' });
    }
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user id
// @access   Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar'
    ]);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).send('Server error');
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user and posts
// @access   Private

router.delete('/', authMiddleware, async (req, res) => {
  try {
    // !TODO Remove posts
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: 'User removed' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
  '/experience',
  [
    authMiddleware,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, from, to, location, current, description } = req.body;
    const newExperience = { title, company, from, to, location, current, description };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route    DELETE api/profile/experience/exp_id
// @desc     Delete profile experience
// @access   Private

router.delete('/experience/:exp_id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const newExperience = profile.experience.filter(exp => !exp._id.equals(req.params.exp_id));
    profile.experience = newExperience;
    await profile.save();

    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put(
  '/education',
  [
    authMiddleware,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('field_of_study', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, school, from, to, degree, current, description, field_of_study } = req.body;
    const newEducation = { title, school, from, to, degree, current, description, field_of_study };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server error');
    }
  }
);

// @route    DELETE api/profile/education/edu_id
// @desc     Delete profile education
// @access   Private

router.delete('/education/:edu_id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const newEducation = profile.education.filter(edu => !edu._id.equals(req.params.edu_id));
    profile.education = newEducation;
    await profile.save();

    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
