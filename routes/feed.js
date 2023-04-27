const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { Profile } = require("../models/profile");
const { User } = require("../models/user");

router.get("/", authenticateUser, async (req, res) => {

    try {
        // get the latest posts
        const myProfile = await Profile.findOne({user : req.user._id}).populate("user");
        res.status(200).render('feed.ejs', {myProfile: myProfile})
    }
    catch (err) {
        console.error(err);
        res.status(500).send({status: "Profile Not Found"});
    }
     
});

module.exports = router;
