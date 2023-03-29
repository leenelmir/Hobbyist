const jwt = require('jsonwebtoken');
const Joi = require("Joi");
const { User } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const config = require("config");

function validate(req) {
    console.log("inside validate");
    const schema = Joi.object({
        username: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(8).max(1024).required()
    });

   const validationResult = schema.validate(req);
   if (validationResult.error) {
    const errorDetails = validationResult.error.details;

    for (let i = 0; i < errorDetails.length; i++) {
        const error = errorDetails[i];
        if (error.path.includes("password")) {
            return "Password is invalid or missing : must be at least 8 letters";
        } if (error.path.includes("username")) {
            return "Username is invalid or missing";
        }
      }
    }

   else {
        return "all good";
   }
};

router.post("/", async (req, res) => {
    
    const status = validate(req.body);
    
    if(status != 'all good'){
        console.log("all not good")
        return res.json({status : status})
    }

    let user = await User.findOne({ username: req.body.username });
    if(!user){
        console.log("user")
        return res.json({status: "Username does not exist"})
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
        console.log("pass")
        return res.json({status: "Password is incorrect"})
    }
    const token = jwt.sign({ _id: user._id}, config.get('jwtPrivateKey'));
    
    res.status(200).header("x-auth-token", token).send({status: "ok", data: token});
});

module.exports = router;
