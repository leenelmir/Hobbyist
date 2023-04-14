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
          return res.status(404).json({status: "Profile was not found!"});
      }

      res.status(200).render('edit_profile', {myProfile : profile});
  }
  catch (error) {
      return res.status(500).json({ error: 'Server error' });
  }
});

router.post("/edit/update-profile-image", authenticateUser, async (req, res) => {
  try {
    const profile = await Profile.findOne({user : req.user._id});
    if (!profile){
      return res.status(400).json({status : "Profile not found!"})
    }
    profile.profilePicture = req.body.profilePicture;
    await profile.save();
    return res.status(200).json({status : "profile updated"})
  }
  catch (err) {
    console.error();
  }
})


router.post("/edit", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.id;
      const profile = await Profile.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({status: "Profile was not found!"});
      }
      
      if (req.body.hasOwnProperty("description")) {
        if (req.body.description.length === 0)
          profile.description = "N/A"
        else profile.description = req.body.description;
      }

      if (req.body.hasOwnProperty("hobbies")) {
        const tempHobbies = [];
        const hobbies = req.body.hobbies;
        if(hobbies.length === 0) 
          profile.hobbies = "N/A"; 
        else {for (let i = 0; i < hobbies.length; i++) {
          tempHobbies.push(hobbies[i]);
        }
        profile.hobbies = tempHobbies;
      }
      }

      if (req.body.hasOwnProperty("location")){
        if (req.body.location.length === 0)
          profile.location = "N/A"
        else 
          profile.location = req.body.location;
      }

      if (req.body.hasOwnProperty("gender")){
        if (req.body.gender.length === 0)
          profile.gender = "N/A"
        else 
          profile.gender = req.body.gender;
}

  
      await profile.save();
      res.status(200).json({ profile : profile, status : "profile updated"});

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
  
    const otherProfile = await Profile.findOne({ user: user._id }).populate('user');
    if (!otherProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
  
    const myProfile = await Profile.findOne({user: req.user._id}).populate('user');
    return res.status(200).render('others_profile.ejs', {otherProfile: otherProfile, currentUserId: req.user._id,
    requestedUserId: user._id, myProfile : myProfile});
  
  } catch (error) { 
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
  
  });


module.exports = router;