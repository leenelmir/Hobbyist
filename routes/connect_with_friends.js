const jwt = require('jsonwebtoken');
const Joi = require("Joi");
const { User } = require("../models/user");
const { Profile } = require("../models/profile");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const config = require("config");
const cookie = require("cookie");
const authenticateUser = require('../middleware/auth');

router.get("/", authenticateUser, async (req, res) =>{
    try {
    const myProfile = await Profile.findOne({user : req.user._id}).populate("user");
    return res.status(200).render('Friends', {myProfile : myProfile});
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({status: "Internal Server Error"});
    }
})
;

module.exports = router;