const { Friendship } = require("../models/friendship");
const { User } = require("../models/user");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/request", authenticateUser, async (req, res) => {     
    try
    {
        const senderID = req.body.sender;           
        const receiverID = req.body.receiver;
        
        const senderUser = await User.findOne({     // (2): AFTER ADDING BACK THE MIDDLEWARE, MAKE THE NECESSARY ADJUSTMENTS
            _id: senderID
        });
        const receiverUser = await User.findOne({
            _id: receiverID
        });

        if(!receiverUser)
            return res.status(400).json({status : "User requesting friendship with does not exist!"});

        const existingRequest = await Friendship.findOne({
            sender: senderID,
            receiver: receiverID
        });

        console.log(senderUser.friends);

        if(senderUser.friends.includes(receiverUser.username)) // (2): REPLACE ARGUMENT WITH req.user.username
            return res.status(400).json({status: "Already friends with that user!"});
        
        if(existingRequest) // a request has already been sent and is still pending
            return res.status(400).json({status: "Request already sent!"});

        const newFriendship = new Friendship({
            sender: senderID,
            receiver: receiverID
        });

        await newFriendship.save();
        return res.status(200).json({status: "Request successfully sent!"});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({status: "Server error"});
    }
});

router.post("/check-request", authenticateUser, async (req, res) => {     
    
    console.log("check request: " + req.body.myUserId);
    try
    {
        if (!req.body.myUserId || !req.body.otherUserId){
            return res.status(400).json({status: "Check request invalid!"});
        }
     
        const senderID = req.body.myUserId;           
        const receiverID = req.body.otherUserId;

        const existingRequest = await Friendship.findOne({
            sender: senderID,
            receiver: receiverID
        });

        if(existingRequest) // a request has already been sent and is still pending
            return res.status(200).json({status: "Request pending!"});

        return res.status(400).json({status : "Not friends!"});
    }
    catch(err)
    {
        console.log(req.body);
        console.error(err);
        return res.status(500).json({status : "Server error"});
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
            return res.status(400).json({status : "Invalid user!"});
        
        const friendship = await Friendship.findOne({ 
            sender: senderID,
            receiver: receiverUser._id
        });

        if(!friendship)
            return res.status(400).json({status: "No existing friend request!"});

        await Friendship.findOneAndRemove({
            sender: senderID,
            receiver: receiverUser._id
        });

        receiverUser.friends.push(senderUser.username);
        senderUser.friends.push(receiverUser.username);

        receiverUser.save();
        senderUser.save();
        
        return res.status(200).json({status : "Friendship accepted"});

    } catch (err) {
        console.error(err);
        return res.status(500).json({status : "Server error"});
    }
});

router.post("/reject", async (req, res) => {
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
        
        return res.status(200).send("Friendship declined!");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }
});


module.exports = router;