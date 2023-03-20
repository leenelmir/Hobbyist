const Joi = require("joi");
const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/users");
const auth = require("./routes/auth");
const bodyparse = require('body-parser');
const config = require("config");
const app = express();


if(!config.get("jwtPrivateKey")){
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}
mongoose.connect("mongodb://localhost:27017/HobbyWebsite")
        .then( () => console.log("Connected to MongoDB..."))
        .catch(err => console.error("Could not connect to MongoDB", err));



app.use(bodyparse.json());
app.use(bodyparse.urlencoded( { extended: true }));
app.use("/api/users", users);
app.use("/api/auth", auth);


app.get("/", (req, res) => {
    res.send("Hello World!");
});




app.listen(3000, () => {
    console.log("Listening to port 3000...");
});
