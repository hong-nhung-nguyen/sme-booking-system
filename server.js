const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const database = require("./src/config/database");
database.connect();

const apiV1 = require("./src/api/v1/routes/index.route");

apiV1(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})


