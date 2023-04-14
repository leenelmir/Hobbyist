const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on("message", message => {
    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = event.target.elements.msg.value;
    socket.emit("chatMessage", message);

    event.target.elements.msg.value = "";
    event.target.elements.msg.focus();
})

function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
       ${ message.text }
    </p>
    `;
    chatMessages.append(div);
}

function outputRoomName(room) {
    document.getElementById("room-name").innerHTML = room;
}

function outputUsers(users) {
    document.getElementById("users").innerHTML = ` ${users.map(user => `<li>${ user.username }</li>`).join("")}`;
}