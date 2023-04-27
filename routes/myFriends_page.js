const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { Profile } = require("../models/profile");
const { Friendship } = require("../models/friendship");
const { User } = require("../models/user");


router.get('/', authenticateUser, async (req, res) =>{

    try {
        const profile = await Profile.findOne({user : req.user._id}).populate("user");
        res.status(200).render('myFriends_page.ejs', {profile : profile})
        }
        catch (err) {
            console.error(err);
            res.status(500).send({status: "Profile not found"});
        }
});

router.post("/check-request", authenticateUser, async (req, res) => {     
    
    console.log("check request: " + req.body.myUserId);

    try
    {
        const user = await User.findOne({user: req.user._id});
        const friendships = await Friendship.findOne({receiver: req.user._id});
        if (!friendships){
            return res.status(200).json({status: "No requests!"});
        }
        return res.status(200).json({status: "done", friendships : friendships});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({status : "Server error"});
    }
});

module.exports = router;