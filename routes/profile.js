const { Profile } = require("../models/profile");
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");


router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const userId = req.body.user;
        const profile = await Profile.findOne({ user: userId }).populate('user');
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

module.exports = router;