const { Post } = require("../models/post");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();


router.post("/post", authenticateUser, async (req, res) => {
    try
    {
        const tempHobbies = [];
        const currentDate = new Date().toISOString().slice(0, 10);

        for(hobby in req.body.hobbies)
        {
            tempHobbies.push(hobby);
        }
        const post = new Post({
            user: req.user._id,
            postPicture: req.picture,
            caption: req.caption,
            hobbies: tempHobbies,
            datePosted: currentDate
        })

        await post.save();
        return res.status(200).json({ "status": "Post uploaded successfully!"});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ "status": "Server error!" });
    }
    
})