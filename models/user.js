const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    phone: {
        type: String,
        required: true,
        match: /^\+\d{3}\d{8}$/
    }
});
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id}, config.get('jwtPrivateKey'));
};
const User = mongoose.model("Users", userSchema);


function validateUser(user) {
    
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(1024).required(),
        phone:Joi.string().required()
    });
   
    return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
