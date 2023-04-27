const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const { Profile } = require("../models/profile");

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
        const { room } = req.params;
        const userName = req.user.username;

        return res.status(200).render("chat.html", { roomName: room, userName: userName });
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
    
});


module.exports = router;