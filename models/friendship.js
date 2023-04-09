const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    status: String
  });

const Friendship = mongoose.model("Friendships", friendshipSchema);

exports.Friendship = Friendship;