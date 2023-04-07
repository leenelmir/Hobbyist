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

    user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'password','phone', 'username']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    const profile = new Profile({
        user: user._id,
        description: null,
        profilePicture: null,
        hobbies: []
    });
    await profile.save();
    
    const token = jwt.sign({ _id: user._id}, config.get('jwtPrivateKey'));
    res.cookie("token", token, {httpOnly:true}).status(200).send({"user": _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'username']),
    "status": "ok"});
    
});

module.exports = router;
