const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const { Profile } = require("../models/profile");
const { User } = require("../models/user");

router.get("/leave", authenticateUser, async (req, res) => {
    console.log("Hello");
    res.redirect('/rooms');
});

router.get("/", authenticateUser, async (req, res) => {

    try {
        const userId = req.user._id;
        const profile = await Profile.findOne({ user: userId }).populate('user');
        if(!profile)
        {
            return res.status(404).json({status: "Profile was not found!"});
        }
  
       return res.status(200).render('rooms.ejs', {myProfile : profile});
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get("/:room", authenticateUser, async (req, res) => { 
    try
    {
        const roomName = req.params.room;
        const user = await User.findOne({
            _id: req.user._id
        });

        return res.status(200).render("chat", { roomName: roomName, userName: user.username });
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
    
});



module.exports = router;