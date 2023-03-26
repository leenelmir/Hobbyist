const jwt = require("jsonwebtoken");
const config = require("config");
const {User, validate} = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
   
    const { error } = validate(req.body);
    if(error){
        return res.status(400).json({status: "invalid"})
    }

    let user = await User.findOne({ email: req.body.email });
    if(user){
        return res.status(400).json({status: "Email already registered. Please try another email!"});
    }

    user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'password','phone']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    
    const token = jwt.sign({ _id: user._id}, config.get('jwtPrivateKey'));
    res.header("x-auth-token", token).status(200).send({"user": _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone']),
    "status": "ok"});
});

module.exports = router;
