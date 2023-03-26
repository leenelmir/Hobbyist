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
    const schema = Joi.object({
        username: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(1024).required()
    });

    return schema.validate(req);
};

router.post("/", async (req, res) => {
    
    const { error } = validate(req.body);

    if(error){
        return res.json({status: 'Invalid email or password 1'})
    }

    let user = await User.findOne({ email: req.body.username });
    if(!user)
        return res.json({status: "Invalid email or password"})
    
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword)
        return res.json({status: "Invalid email or password"})

    const token = jwt.sign({ _id: user._id}, config.get('jwtPrivateKey'));
    
    res.status(200).header("x-auth-token", token).send({status: "ok", data: token});
});

module.exports = router;
