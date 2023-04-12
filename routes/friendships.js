const { Friendship } = require("../models/friendship");
const { User } = require("../models/user");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("", async (req, res) => {
    try {
        const senderID = req.body.sender;


    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }

})

router.post("/request", async (req, res) => {       // NOTE: ADD BACK THE MIDDLEWARE AND CHANGE ANY NECESSARY CODE AFTER TESTING IS DONE
    try
    {
        const senderID = req.body.sender;           // after adding back the middleware, change this to req.user._id
        const receiver = req.body.receiver;

        const senderUser = await User.findOne({     // (2): AFTER ADDING BACK THE MIDDLEWARE, MAKE THE NECESSARY ADJUSTMENTS
            _id: senderID
        });
        const receiverUser = await User.findOne({
            username: receiver
        });

        if(!receiverUser)
            return res.status(400).send("User requesting friendship with does not exist!");
        
        const receiverID = receiverUser._id;

        const existingRequest = await Friendship.findOne({
            sender: senderID,
            receiver: receiverID
        });

        console.log(senderUser.friends);

        if(senderUser.friends.includes(receiverUser.username)) // (2): REPLACE ARGUMENT WITH req.user.username
            return res.status(400).send("Already friends with that user!");
        
        if(existingRequest) // a request has already been sent and is still pending
            return res.status(400).send("Request already sent!");

        const newFriendship = new Friendship({
            sender: senderID,
            receiver: receiverID
        });

        await newFriendship.save();
        return res.status(200).send("Request successfully sent!");
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).send("Server error");
    }
});

router.post("/accept", async (req, res) => {
    try
    {
        const senderID = req.body.sender;
        const receiver = req.body.receiver;

        const senderUser = await User.findOne({
            _id: senderID
        });
        const receiverUser = await User.findOne({
            username: receiver
        });

        if(!senderUser || !receiverUser)
            return res.status(400).send("Invalid user!");
        
        const friendship = await Friendship.findOne({ 
            sender: senderID,
            receiver: receiverUser._id
        });

        if(!friendship)
            return res.status(400).send("No existing friend request!");

        await Friendship.findOneAndRemove({
            sender: senderID,
            receiver: receiverUser._id
        });

        receiverUser.friends.push(senderUser.username);
        senderUser.friends.push(receiverUser.username);

        receiverUser.save();
        senderUser.save();
        
        return res.status(200).send("Friendship accepted");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }
});

module.exports = router;