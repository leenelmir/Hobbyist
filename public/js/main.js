const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const divHelper = document.getElementById("helper");

const usernameHelper = document.getElementById("helper").getAttribute("data-username");
const roomHelper = document.getElementById("helper").getAttribute("data-room")

const socket = io();

socket.emit("joinRoom", { usernameHelper, roomHelper});

socket.on("roomUsers", ({ room, users }) => {
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


function outputUsers(users) {
    document.getElementById("users").innerHTML = ` ${users.map(user => `<li>${ user.username }</li>`).join("")}`;
}