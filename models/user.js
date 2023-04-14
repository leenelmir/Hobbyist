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
    username: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50
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
        required: true
    },
    friends: [{
        type: String,
    }]
});
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id}, config.get('jwtPrivateKey'));
};
const User = mongoose.model("Users", userSchema);


function validateUser(user) {
    
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        username: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(1024).required(),
        phone:Joi.string().required()
    });
   

    const validationResult = schema.validate(user);

    if (validationResult.error) {
    const errorDetails = validationResult.error.details;

    for (let i = 0; i < errorDetails.length; i++) {
        const error = errorDetails[i];
        if (error.path.includes("email")) {
            return "Email is invalid or missing";
        } if (error.path.includes("password")) {
            return "Password is invalid or missing : must be at least 8 letters";
        } if (error.path.includes("username")) {
            return "Username is invalid or missing";
        } if (error.path.includes("phone")) {
            return "Phone is invalid or missing";
        }
    }
    }

    return  "all good";
};

exports.User = User;
exports.validate = validateUser;
