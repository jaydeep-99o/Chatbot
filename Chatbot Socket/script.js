// Connect to the Socket.IO server
const socket = io("http://localhost:3000"); // Replace with your server URL if hosted remotely

// DOM Elements
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send_message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");

// User data for messages and files
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null,
    },
};

// Function to create a message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Handle sending messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();

    // Get the message from the input
    userData.message = messageInput.value.trim();
    if (!userData.message) return;

    // Display the user's message in the chat
    const messageContent = `
        <div class="message-text">${userData.message}</div>
        ${
            userData.file.data
                ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>`
                : ""
        }`;

    const userMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(userMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Send the message and file to the server
    socket.emit("message", {
        message: userData.message,
        file: userData.file.data ? { mime_type: userData.file.mime_type, data: userData.file.data } : null,
    });

    // Clear the input and file data
    messageInput.value = "";
    userData.file = { data: null, mime_type: null };
};

// Handle incoming messages from the server
socket.on("bot-response", (data) => {
    const messageContent = `
        <div class="message-text">${data.message}</div>
        ${
            data.file
                ? `<img src="data:${data.file.mime_type};base64,${data.file.data}" class="attachment"/>`
                : ""
        }`;

    const botMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(botMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
});

// Handle file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1];

        // Update the userData object with file details
        userData.file = {
            data: base64String,
            mime_type: file.type,
        };

        // Preview the uploaded file
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");

        // Clear the file input
        fileInput.value = "";
    };

    reader.readAsDataURL(file);
});

// Event listener for the send button
sendMessageButton.addEventListener("click", handleOutgoingMessage);

// Allow sending messages with the Enter key
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleOutgoingMessage(e);
    }
});

// Trigger file input click when file upload button is clicked
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
