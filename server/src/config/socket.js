const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

let io;

// Initialize Socket.IO with the HTTP server
const initializeSocket = (server) => {
    io = require("socket.io")(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    // Authenticate socket connections via JWT token from handshake
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("join", (userId) => {
            if (userId === socket.userId) {
                socket.join(userId);
            }
        });

        socket.on("disconnect", () => {
            logger.info("Client disconnected");
        });
    });
};

// Get the initialized Socket.IO instance
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO,
};
