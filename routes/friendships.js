const { Friendship } = require("../models/friendship");
const { User } = require("../models/user");
const authenticateUser = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/friends", authenticateUser, async (req, res) => {
    try
    {
        const senderID = req.body.sender;
        const senderUser = await User.findOne({
            _id: senderID
        });
        return res.status(200).json({ friends: senderUser.friends });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ status: "Server error" });
    }
});

router.get("/requests", authenticateUser, async (req, res) => {
    try
    {
        const senderID = req.body.sender;
        const requests = await Friendship.findAll({
            where: {
                receiver: senderID
            }
        })
        const requesters = requests.map(request => request.sender);

        const requesterUsers = [];

        for(const requester in requesters) {
            const senderUser = await User.findOne({
                _id: requester
            });
            if(senderUser)
                requesterUsers.push(senderUser);
        }
        return res.status(200).json({ requesters: requesterUsers });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ status: "Server error" });
    }
});

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
        console.error(err);
        return res.status(500).json({status : "Server error"});
    }
});

router.post("/accept", authenticateUser, async (req, res) => {
    try
    {
        const senderUsername = req.body.sender;
        const receiverId = req.user._id;

        const senderUser = await User.findOne({
            username: senderUsername
        });

        const receiverUser = await User.findOne({
            _id: receiverId
        });

        if(!senderUser || !receiverUser)
            return res.status(400).json({status : "Invalid user!"});
        
        const friendship = await Friendship.findOne({ 
            sender: senderUser._id,
            receiver: receiverId
        });

        if(!friendship)
            return res.status(400).json({status: "No existing friend request!"});

        await Friendship.findOneAndRemove({
            sender: senderUser._id,
            receiver: receiverId
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

router.post("/reject", authenticateUser, async (req, res) => {

    try
    {
        const senderUsername = req.body.sender;
        const receiverId = req.user._id;

        const senderUser = await User.findOne({
            username: senderUsername
        });
        const receiverUser = await User.findOne({
            _id: receiverId
        });

        if(!senderUser || !receiverUser)
            return res.status(400).json({status: "Invalid user!"});
        
        const friendship = await Friendship.findOne({ 
            sender: senderUser._id,
            receiver: receiverUser._id
        });

        if(!friendship)
            return res.status(400).json({status: "No existing friend request!"});

        await Friendship.findOneAndRemove({
            sender: senderUser._id,
            receiver: receiverUser._id
        });
        
        return res.status(200).json({status: "Friendship declined!"});

    } catch (err) {
        console.error(err);
        return res.status(500).json({status:"Server error"});
    }
});


module.exports = router;