const express = require("express");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const { routeNotFound, errorHandler } = require("./middlewares");

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/", routes);

app.use(routeNotFound);
app.use(errorHandler);

module.exports = app;
