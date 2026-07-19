const dns = require("node:dns");
const express = require("express");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

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
    res.status(500).json({
        success: false,
        message: err.message
    });
});
// End global error handler

const startServer = async () => {
    try {
        await database.connect();

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        })
    } catch (error) {
        console.error("Failed to start server: ", error.message);
        process.exit(1);
    }
};

startServer();




