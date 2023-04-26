const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { Profile } = require("../models/profile");

router.get("/", authenticateUser, async (req, res) => {

    // need the current username and profile picture
    try {
        const myProfile = await Profile.findOne({user : req.user._id}).populate("user");
        res.status(200).render('feed.ejs', {myProfile : myProfile})
        }
        catch (err) {
            console.error(err);
            res.status(500).send({status: "Profile not found"});
        }
     
});

module.exports = router;