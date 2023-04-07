const { Profile } = require("../models/profile");
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { User } = require("../models/user");


router.get("/", authenticateUser, async (req, res) => {
    try {
        const userId = req.body.userID;
        const profile = await Profile.findOne({ _id: userId }).populate('user');
        if(!profile)
        {
            return res.status(404).send("Profile was not found!");
        }
        res.render('profile', { profile });
    }
    catch(err)
    {
        console.error(err);
        res.status(500).send("Server error");
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
  
      await profile.save();
      res.render("profile", { profile });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

router.get("/:username", authenticateUser, async (req, res) => {
    try
    {
        const user = User.findOne( { username: req.params.username });
        const profile = await Profile.findOne( { user:  user._id } ).populate('user');
        if(!profile)
        {
            return res.status(404).send("Profile was not found!");
        }
        res.render('profile', { profile });
    }
    catch (err)
    {
        console.error(err);
        res.status(500).send("Server error");
    }
})

module.exports = router;