const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { Post } = require("../models/post");
const { Profile } = require("../models/profile");
const { User } = require("../models/user");


router.get("/", authenticateUser, async (req, res) => {

    try {
        // get the latest posts
        const myProfile = await Profile.findOne({user : req.user._id}).populate("user");
         if (!myProfile)
            return res.status(404).json({status : "Profile not found!"});
       
        const myPosts = await Post.find({ user : req.user._id}).populate("user");
       
        res.status(200).render('my_posts.ejs', {myProfile: myProfile, myPosts : myPosts.reverse()});
    }
    catch (err) {
        console.error(err);
        res.status(500).send({status: "Profile Not Found"});
    }
     
});


module.exports = router;