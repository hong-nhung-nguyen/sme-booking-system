const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const database = require("./src/config/database");
database.connect();

app.get("/", (req, res) => {
    res.send("booking system");
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})


