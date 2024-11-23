const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for testing
        methods: ["GET", "POST"],
    },
});

// Serve static files (e.g., frontend)
app.use(express.static("public"));

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle messages from the client
    socket.on("message", (data) => {
        console.log("Message received from client:", data);
        
        // Send a bot response back to the client
        socket.emit("bot-response", { message: `You said: ${data.message}` });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
