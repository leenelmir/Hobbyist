const { Friendship } = require("../models/friendship");
const { User } = require("../models/user");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/request", async (req, res) => {       //NOTE: ADD BACK THE MIDDLEWARE AND CHANGE ANY NECESSARY CODE AFTER TESTING IS DONE
    try
    {
        const senderID = req.body.sender;           // after adding back the middleware, change this to req.user._id
        const receiver = req.body.receiver;
        const receiverUser = await User.findOne({
            username: receiver
        });

        if(!receiverUser)
            return res.status(400).send("User requesting friendship with does not exist!");
        
        const receiverID = receiverUser._id;
        const existingFriendship = await Friendship.findOne({
            $or: [
                {
                    sender: senderID,
                    receiver: receiverID
                },
                {
                    sender: receiverID,
                    receiver: senderID
                }
            ],
            status: "accepted"
        });

        const existingRequest = await Friendship.findOne({
            sender: senderID,
            receiver: receiverID,
            status: "pending"
        });


        if(existingFriendship) // a friendship is already found between the 2 users
            return res.status(400).send("Already friends with that user!");
        
        if(existingRequest) // a request has already been sent and is still pending
            return res.status(400).send("Request already sent!");

        const newFriendship = new Friendship({
            sender: senderID,
            receiver: receiverID,
            status: "pending"
        });

        await newFriendship.save();
        return res.status(200).send("Request successfully sent!");
    }
    catch(err)
    {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;