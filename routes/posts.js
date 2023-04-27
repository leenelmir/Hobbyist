const { Post } = require("../models/post");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { Profile } = require("../models/profile");
const {User} = require("../models/user");

router.get("/feed", authenticateUser, async (req, res) => {
        try {

            // get the latest posts
            const user = await User.findOne({_id: req.user._id});
            if (!user){
                return res.status(400).send({status: "User not found!"});
            }

            const friendUsernames = user.friends;
        
            const friendIds = []; // array of usernames of friends
            for (const friendUsername of friendUsernames) {
                const friend = await User.findOne({username : friendUsername});
                if (friend) {
                    friendIds.push(friend._id);
                }
            }
            // all profiles of user's friends, returns all profiles of friends
            const friendProfiles = await Profile.find({ user: { $in: friendIds } });
    
            // fill posts and sort posts of EACH USER
            const friendPostPromises = friendProfiles.map(friendProfile => {
                return friendProfile.populate({ 
                    path: 'posts', 
                    options: { 
                        sort: { datePosted: -1 }, 
                        limit: 20 
                    } 
                });
            });
    
            // flatten the double array of posts
            const friendPosts = await Promise.all(friendPostPromises)
                                             .then(postsArr => postsArr.flatMap(posts => posts.posts));
    
            // Sort the posts by latest first FOR ALL USERS 
            friendPosts.sort((a, b) => b.datePosted - a.datePosted);
            var last5 = friendPosts.slice(0,20); // SPECIFY SIZE
            var last5Details = [];

            await Promise.all(last5.map(async (friendPost, i) => {
                const friendUser = await User.findOne({_id : friendPost.user});
                const friendProfile = await Profile.findOne({user : friendPost.user});
                last5Details[i] = {username : friendUser.username, profilePicture : friendProfile.profilePicture};
              }));
              
              return res.status(200).json({friendPosts : last5, friendPostsDetails: last5Details});
        }
        catch (err) {
            console.error(err);
           return res.status(500).send({status : "Internal Server Error"}); 
        }
})

router.post("/", authenticateUser, async (req, res) => {
    try
    {
        const tempHobbies = [];
        const currentDate = new Date().toISOString().slice(0, 10);
        const hobbies = req.body.hobbies;

        hobbies.forEach(hobby => {
            console.log(hobby);
            tempHobbies.push(hobby);
        });

        console.log("posting " + req.body.hobbies + " " + tempHobbies);
        const post = new Post({
            user: req.user._id,
            postPicture: req.body.picture,
            caption: req.body.caption, 
            hobbiesTags: tempHobbies, 
            datePosted: currentDate
        })

        const profile = await Profile.findOne({ user: req.user._id}).populate('user');
      
        if (!profile)
            return res.status(400).json({"status": "Profile not found!"});

        profile.posts.push(post._id);
        await post.save();
        await profile.save();
        return res.status(200).json({ "status": "Post uploaded successfully!"});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ "status": "Server error!" });
    }
    
})

module.exports = router;