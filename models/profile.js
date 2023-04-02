const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    name: String,
    description: String,
    profilePicture: String,
    hobbies: [String]
  });

const Profile = mongoose.model("Profiles", profileSchema);

exports.Profile = Profile;

