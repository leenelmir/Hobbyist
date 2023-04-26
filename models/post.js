const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    postPicture: String,
    caption: String,
    hobbiesTags: [String],
    datePosted: String
  });

const Profile = mongoose.model("Profiles", postSchema);

exports.Profile = Profile;

