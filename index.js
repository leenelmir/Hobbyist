const Joi = require("Joi");
const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/users");
const auth = require("./routes/auth");
const profile = require("./routes/profile");
const friendship = require("./routes/friendships");
const bodyparse = require('body-parser');
const cookieParser = require("cookie-parser");
const config = require("config");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = socketio(server);
const cors = require('cors');
app.use(cookieParser());
app.use(express.static("public"))
app.use(cors({ exposedHeaders: 'x-auth-token' }))
app.set('view engine', 'ejs');
app.use(bodyparse.json({ limit: '10mb' }));
app.use(express.json());
app.use(bodyparse.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")))

const botName = "Hobbyist Bot";


io.on('connection', socket => {
    console.log("New websocket connection...");

    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit("message", formatMessage(botName, "Welcome to the room!"));

        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${ user.username } has joined the room.`));

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on("chatMessage", message => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, message));
    });


    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user)
        {
            io.to(user.room).emit("message", formatMessage(botName, `${ user.username } has left the room.`));
            
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
            
    });

});

if(!config.has("jwtPrivateKey")){
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}
mongoose.connect("mongodb://127.0.0.1:27017/HobbyWebsite")
        .then( () => console.log("Connected to MongoDB..."))
        .catch(err => console.error("Could not connect to MongoDB", err));


app.get('/signup', (req, res) => {
    res.render('signup');
})

app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/friendships", friendship);
app.use("/profile", profile);
app.get("/", (req, res) => {res.render('index');});

server.listen(3000, () => {
    console.log("Listening to port 3000...");
});
