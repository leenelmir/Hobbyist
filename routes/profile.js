const { Profile } = require("../models/profile");
const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { User } = require("../models/user");
const jwt = require('jsonwebtoken');
const config = require('config');

router.get("/edit", authenticateUser, async (req, res) => {
 
  try {
      const userId = req.user._id;
      const profile = await Profile.findOne({ user: userId }).populate('user');
      if(!profile)
      {
          return res.status(404).send("Profile was not found!");
      }

      res.send("ALL GOOD");
  }
  catch (error) {
      return res.status(500).json({ error: 'Server error' });
  }
});

router.post("/", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.id;
      const profile = await Profile.findOne({ user: userId });
      if (!profile) {
        return res.status(404).send("Profile was not found!");
      }
  
      if (req.body.hasOwnProperty("name")) {
        profile.name = req.body.name;
      }
      if (req.body.hasOwnProperty("description")) {
        profile.description = req.body.description;
      }
      if (req.body.hasOwnProperty("profilePicture")) {
        profile.profilePicture = req.body.profilePicture;
      }
      if (req.body.hasOwnProperty("hobbies")) {
        profile.hobbies = req.body.hobbies;
      }

      if (req.body.hasOwnProperty("location")){
        profile.location = req.body.location;
      }
  
      await profile.save();
      res.render("profile", { profile });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  router.get("/:username",authenticateUser, async (req, res) => {
    const username = req.params.username;
   
  try {
  
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const profile = await Profile.findOne({ user: user._id }).populate('user');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
  
    return res.status(200).render('others_profile.ejs', {profile: profile, currentUserId: req.user._id,
    requestedUserId: user._id});
  
  } catch (error) { 
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
  
  });


module.exports = router;