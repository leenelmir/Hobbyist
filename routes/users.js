const jwt = require("jsonwebtoken");
const config = require("config");
const {User, validate} = require("../models/user");
const { Profile } = require("../models/profile");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
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


module.exports = router;
