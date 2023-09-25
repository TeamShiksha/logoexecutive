const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { routeNotFound, errorHandler } = require("./middlewares");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.use(routeNotFound);
app.use(errorHandler);

module.exports = app;
