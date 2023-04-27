const jwt = require("jsonwebtoken");
const config = require("config");
const {User, validate} = require("../models/user");
const { Profile } = require("../models/profile");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();

router.post("/", async (req, res) => {
   
    const reply = validate(req.body);
    if (reply != 'all good'){
        return res.status(400).json({status: reply});
    }

    /*check email availability*/
    let user = await User.findOne({ email: req.body.email });
    if(user){
        return res.status(400).json({status: "An account already exists with this email. Please login or try another email!"});
    }

    /*check username availability*/
    user = await User.findOne({ username: req.body.username });
    if(user){
        return res.status(400).json({status: "Username already exists. Please try another username!"});
    }

    user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'password','username']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    const profile = new Profile({
        user: user._id,
        description: 'N/A',
        profilePicture: req.body.gender === "male" ? "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png" :
        "https://www.w3schools.com/howto/img_avatar2.png",
        hobbies: [],
        gender: req.body.gender,
        location: 'N/A'
    });
    await profile.save();
    
    const token = jwt.sign({ _id: user._id}, config.get('jwtPrivateKey'));
    res.cookie("token", token, {httpOnly:true}).status(200).send({"user": _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'username', 'gender', 'location']),
    "status": "ok"});
    
});

router.get("/friends", authenticateUser, async (req, res) => {
    const { offset, limit } = req.query;
    const user = await User.findOne({_id : req.user._id});
    if (!user){
        return res.status(500).send({status: "User not found!"});
    }
    const usernames = user.friends;
    const profilePictures = []; // FIX THIS ONCE ACCEPTED

    for (let i = 0; i < usernames.length; i++){
        const profile = await Profile.findOne({}).populate({
            path: 'user',
            match: { username: usernames[i] }
        });   
        profilePictures.append(profile.profilePicture);
    }
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    if (usernames.length == 0)
        return res.status(200).send({usernames: usernames, profilePictures: profilePictures});

    const subUsernames = usernames.slice(start, end > usernames.length ? usernames.length : end);
    const subProfilePics = profilePictures.slice(start, end > usernames.length ? usernames.length : end);
    
    return res.status(200).send({ usernames: subUsernames, profilePictures : subProfilePics });
});

module.exports = router;
