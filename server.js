const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const database = require("./src/config/database");
database.connect();

const apiV1 = require("./src/api/v1/routes/index.route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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




