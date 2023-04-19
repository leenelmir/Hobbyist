const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();

router.get("/rooms/:room", authenticateUser, async (req, res) => {
    try
    {
        const { room } = req.params;
        const userName = req.user.username;

        return res.status(200).render("chat.html", { roomName: room, userName: userName });
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
    
});



modules.export = router;