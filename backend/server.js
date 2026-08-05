// Import Node.js built-in http module
const http = require("node:http");
// Import Socket server class
const { Server } = require("socket.io")

const path = require("node:path");
const dns = require("node:dns");
const express = require("express");
const helmet = require("helmet");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const authenticateSocket = require("./src/middlewares/authenticateSocket.middleware");
const registerRoomHandler = require("./src/socket/registerRoomHandlers");

const app = express();
// Create the server after creating the app
const httpServer = http.createServer(app)
const port = process.env.PORT;

const allowedOrigins = (
    process.env.SOCKET_ALLOWED_ORIGINS || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// run authentication for all the attempts to connect a socket ID
io.use(authenticateSocket);

// Add a minimal connection handler
/**
 * io represents the whole socket server
 * 
 * The "connection" runs every time a client successully connect
 * const socket = io("http://localhost:3000");
 * 
 * For each connected client, Socket.IO creates a separate socket 
 * object and passes it to the callback.
 */
io.on("connection", (socket) => {
    registerRoomHandler(socket);

    console.log(`Authenticated socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id} ${reason}`);
    });
});

dns.setServers([
    "10.199.158.188",
    "1.1.1.1",
    "8.8.8.8"
]);

const database = require("./src/config/database");

// Security headers
// automatically sets multiple http response headers to secure web applications against 
// common vulnerabilities (XSS, clickjacking,..)
app.use(helmet());

const apiV1 = require("./src/api/v1/routes/index.route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// ensures the database connection is established before any requests
let databasePromise;

app.use(async (req, res, next) => {
    try {
        databasePromise ||= database.connect();
        await databasePromise;
        next();
    } catch (error) {
        next(error);
    }
});

apiV1(app);

// 404 routes handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});
// end 404 route handler

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message
    });
});
// End global error handler

const startServer = async () => {
    try {
        await database.connect();

        httpServer.listen(port, () => {
            console.log(`App listening on port ${port}`);
        })
    } catch (error) {
        console.error("Failed to start server: ", error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

// Keep this export for the existing tests
module.exports = app;




