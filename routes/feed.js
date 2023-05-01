const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateUser = require("../middleware/auth");
const { Profile } = require("../models/profile");
const { User } = require("../models/user");


async function getPosts(req, res) {
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
          
          return ({friendPosts: last5, friendPostsDetails: last5Details});
    }
    catch (err) {
        console.error(err);
       return res.status(500).send({status : "Internal Server Error"}); 
    }
}

router.get("/", authenticateUser, async (req, res) => {

    try {

        const {friendPosts, friendPostsDetails} = await getPosts(req, res);
        // get the latest posts
        const myProfile = await Profile.findOne({user : req.user._id}).populate("user");
        console.log("insdie here")
        res.status(200).render('feed.ejs', {myProfile: myProfile, friendPosts : friendPosts, 
        friendPostsDetails : friendPostsDetails});
    }
    catch (err) {
        console.error(err);
        res.status(500).send({status: "Profile Not Found"});
    }
     
});

module.exports = router;
